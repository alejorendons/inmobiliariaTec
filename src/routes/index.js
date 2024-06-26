const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Property, Transaction, User, Famous, Bank, Auction } = require("../models"); 

const bcrypt = require('bcryptjs');

// Middleware para mensajes flash y sesiones, si decides implementarlo
const session = require('express-session');
const flash = require('connect-flash');
router.use(session({
    secret: 'tuSecreto',
    resave: false,
    saveUninitialized: true
}));
router.use(flash());

// Ruta principal
router.get("/", (req, res) => {
    res.render("index", {
        logeoInvalido: req.flash('logeoInvalido'),
        usuarioExists: req.flash('usuarioExists')
    });
});

// Registro de usuario
router.get("/register", (req, res) => {
    res.render("register");
});

// Mostrar el formulario de agregar famoso
router.get("/addFamous", (req, res) => {
    res.render("addFamous");
});

// Procesar el formulario de agregar famoso
router.post("/addFamous", async (req, res) => {
    try {
        const { name, nationality, birthDate } = req.body;
        const newFamous = new Famous({ name, nationality, birthDate });
        await newFamous.save();
        res.redirect("/dashboard"); // Redirigir al dashboard
    } catch (error) {
        console.error("Failed to add famous person:", error);
        res.status(500).send("Error al registrar el famoso");
    }
});

// Mostrar propiedades
router.get("/properties", async (req, res) => {
    try {
        const properties = await Property.find().populate('owner');
        const users = await User.find(); // Obtener todos los usuarios
        const famous = await Famous.find()

        res.render("properties", { properties, users, famous });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Error al obtener las propiedades");
    }
});

// Mostrar transacciones
router.get("/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('property')
            .populate('buyer', 'username')
            .populate('seller', 'username')
            .populate('bankId', 'name headquartersLocation'); // Asegúrate de que estás populando el banco correctamente
        
        res.render("transactions", { transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send("Error al obtener las transacciones");
    }
});

// Mostrar subastas
router.get("/auctions", async (req, res) => {
    try {
        const auctions = await Auction.find().populate('property highestBidder');
        res.render("auctions", { auctions });
    } catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).send("Error al obtener las subastas");
    }
});

// Registrar oferta en subasta
router.post("/bid/:auctionId", async (req, res) => {
    const { auctionId } = req.params;
    const { bidderId, bidAmount } = req.body;

    try {
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).send("Subasta no encontrada");
        }

        if (bidAmount <= auction.currentBid) {
            return res.status(400).send("La oferta debe ser mayor que la oferta actual");
        }

        auction.currentBid = bidAmount;
        auction.highestBidder = bidderId;
        auction.bids.push({ bidder: bidderId, amount: bidAmount });
        await auction.save();

        res.redirect("/auctions");
    } catch (error) {
        console.error("Error al realizar la oferta:", error);
        res.status(500).send("Error al realizar la oferta");
    }
});

// Agregar usuario
router.post("/addUser", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        req.flash('usuarioExists', 'El usuario ya existe');
        res.redirect("/");
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();
        req.flash('usuarioExists', 'Usuario creado exitosamente');
        res.redirect("/");
    }
});

// Proceso de login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (user && await bcrypt.compare(password, user.password)) {
        res.redirect("/properties");
    } else {
        req.flash('logeoInvalido', 'Usuario y/o contraseña inválidos');
        res.redirect("/");
    }
});

// Mostrar el formulario de agregar propiedad
// Mostrar el formulario de agregar propiedad
router.get("/addProperty", async (req, res) => {
    try {
        const users = await User.find(); // Obtener todos los usuarios
        const famous = await Famous.find(); // Obtener todos los famosos
        res.render("addProperty", { users, famous }); // Pasar los usuarios y famosos a la vista
    } catch (error) {
        console.error("Error fetching users and famous people:", error);
        res.status(500).send("Error al obtener los usuarios y famosos");
    }
});


// Agregar propiedad
router.post("/addProperty", async (req, res) => {
    try {
        const { type, address, city, country, description, estimatedPrice, ownerId, ownerType } = req.body;
        
        // Verificar si el propietario es un usuario o un famoso
        let owner = null;
        if (ownerType === 'User') {
            owner = await User.findById(ownerId);
        } else if (ownerType === 'Famous') {
            owner = await Famous.findById(ownerId);
        }

        if (!owner) {
            return res.status(404).send("Propietario no encontrado");
        }

        let property = new Property({
            type,
            location: {
                address,
                city,
                country
            },
            description,
            estimatedPrice,
            owner: mongoose.Types.ObjectId(ownerId) // Asegurarse de que ownerId sea un ObjectId
        });
        await property.save();
        res.redirect("/properties");
    } catch (error) {
        console.error("Failed to add property:", error);
        res.status(500).send("Error al registrar la propiedad");
    }
});

// Registrar una nueva transacción
router.post("/newTransaction", async (req, res) => {
    try {
        const { type, propertyId, salePrice, buyerId, sellerId, bankId, currency, hasPenalty } = req.body;

        const buyer = await User.findById(buyerId);
        const seller = await User.findById(sellerId);
        const property = await Property.findById(propertyId);

        if (!buyer || !seller || !property) {
            return res.status(400).send("Datos inválidos de la transacción");
        }

        const commissionRate = 0.05; // 5% comisión
        const taxRate = 0.1; // 10% impuestos, por ejemplo
        const penaltyRate = 0.02; // 2% multa por incumplimiento
        const commission = (salePrice * commissionRate).toFixed(2);
        const taxes = (salePrice * taxRate).toFixed(2);
        const fines = hasPenalty ? (salePrice * penaltyRate).toFixed(2) : 0;

        const newTransaction = new Transaction({
            type,
            property: propertyId,
            salePrice,
            buyer: buyerId,
            seller: sellerId,
            bankId,
            currency,
            commission,
            taxes,
            fines
        });

        await newTransaction.save();

        // Actualizar la propiedad para reflejar el nuevo propietario
        property.owner = buyerId;
        if (type === 'Venta directa') {
            property.forSale = false;
        }
        await property.save();

        res.redirect("/transactions");
    } catch (error) {
        console.error("Error al registrar la transacción:", error);
        res.status(500).send("Error al registrar la transacción");
    }
});

// Ruta para procesar la compra directa de una propiedad
router.post("/buyProperty/:propertyId", async (req, res) => {
    const propertyId = req.params.propertyId;
    const { buyerId, salePrice, currency, hasPenalty } = req.body;

    try {
        const property = await Property.findById(propertyId).populate('owner');
        if (!property) {
            return res.status(404).send("Propiedad no encontrada");
        }

        // Buscar comprador tanto en usuarios como en famosos
        let buyer = await User.findById(buyerId);
        if (!buyer) {
            buyer = await Famous.findById(buyerId);
        }

        if (!buyer) {
            return res.status(404).send("Comprador no encontrado");
        }

        const seller = property.owner;
        if (!seller) {
            return res.status(404).send("Propietario no encontrado");
        }

        const commissionRate = 0.05; // 5% comisión
        const taxRate = 0.1; // 10% impuestos, por ejemplo
        const penaltyRate = 0.02; // 2% multa por incumplimiento
        const commission = (salePrice * commissionRate).toFixed(2);
        const taxes = (salePrice * taxRate).toFixed(2);
        const fines = hasPenalty ? (salePrice * penaltyRate).toFixed(2) : 0;

        const transaction = new Transaction({
            type: 'Compra directa',
            property: property._id,
            salePrice,
            buyer: buyer._id,
            seller: seller._id,
            currency,
            commission,
            taxes,
            fines
        });

        await transaction.save();

        // Actualizar la propiedad para marcarla como vendida
        property.owner = buyer._id;
        property.forSale = false;
        await property.save();

        res.redirect("/properties");
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        res.status(500).send("Error al procesar la compra");
    }
});

// Ruta para mostrar el dashboard
router.get("/dashboard", async (req, res) => {
    try {
        const properties = await Property.find().populate('owner');
        const transactions = await Transaction.find()
            .populate('property')
            .populate('buyer', 'username')
            .populate('seller', 'username')
            .populate('bankId', 'name headquartersLocation');
        const famousList = await Famous.find();

        res.render("dashboard", { properties, transactions, famousList });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Error al obtener los datos del dashboard");
    }
});

// Ruta para mostrar el inventario de famosos
router.get("/famousInventory", async (req, res) => {
    try {
        const famousList = await Famous.find().populate('properties');
        res.render("famousInventory", { famousList });
    } catch (error) {
        console.error("Error fetching famous inventory:", error);
        res.status(500).send("Error al obtener el inventario de famosos");
    }
});

// Ruta para mostrar los informes
router.get("/reports", async (req, res) => {
    try {
        const famousList = await Famous.find();
        res.render("reports", { famousList });
    } catch (error) {
        console.error("Error fetching famous list:", error);
        res.status(500).send("Error al obtener la lista de famosos");
    }
});

// Generar informe de ventas
router.post("/report/sales", async (req, res) => {
    const { startDate, endDate, famousId } = req.body;
    try {
        const query = {
            type: 'Venta directa',
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        };
        if (famousId) {
            query.$or = [{ buyer: famousId }, { seller: famousId }];
        }
        const sales = await Transaction.find(query).populate('property buyer seller');
        res.render("reportSales", { sales });
    } catch (error) {
        console.error("Error generating sales report:", error);
        res.status(500).send("Error al generar el informe de ventas");
    }
});

// Generar informe de compra ventas
router.post("/report/transactions", async (req, res) => {
    const { startDate, endDate, famousId } = req.body;
    try {
        const query = {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        };
        if (famousId) {
            query.$or = [{ buyer: famousId }, { seller: famousId }];
        }
        const transactions = await Transaction.find(query).populate('property buyer seller');
        res.render("reportTransactions", { transactions });
    } catch (error) {
        console.error("Error generating transactions report:", error);
        res.status(500).send("Error al generar el informe de compra ventas");
    }
});

// Generar informe de comisiones
router.post("/report/commissions", async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
        const commissions = await Transaction.aggregate([
            { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            { $group: { _id: null, totalCommissions: { $sum: "$commission" } } }
        ]);
        res.render("reportCommissions", { commissions: commissions[0] });
    } catch (error) {
        console.error("Error generating commissions report:", error);
        res.status(500).send("Error al generar el informe de comisiones");
    }
});

// Generar informe de multas
router.post("/report/fines", async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
        const fines = await Transaction.aggregate([
            { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            { $group: { _id: null, totalFines: { $sum: "$fines" } } }
        ]);
        res.render("reportFines", { fines: fines[0] });
    } catch (error) {
        console.error("Error generating fines report:", error);
        res.status(500).send("Error al generar el informe de multas");
    }
});

// Generar informe de impuestos
router.post("/report/taxes", async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
        const taxes = await Transaction.aggregate([
            { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            { $group: { _id: "$property.location.country", totalTaxes: { $sum: "$taxes" } } }
        ]);
        res.render("reportTaxes", { taxes });
    } catch (error) {
        console.error("Error generating taxes report:", error);
        res.status(500).send("Error al generar el informe de impuestos");
    }
});

router.get('/reportSales', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('property', 'location.address')
            .populate('buyer', 'username')
            .populate('seller', 'username');
        
        res.render('reportSales', { transactions });
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).send('Error generating sales report');
    }
});

router.get('/reportTransactions', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('property', 'location.address')
            .populate('buyer', 'username')
            .populate('seller', 'username');
        
        res.render('reportTransactions', { transactions });
    } catch (error) {
        console.error('Error generating transactions report:', error);
        res.status(500).send('Error generating transactions report');
    }
});


router.get('/reportCommissions', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('property', 'location.address')
            .populate('buyer', 'username')
            .populate('seller', 'username');
        
        res.render('reportCommissions', { transactions });
    } catch (error) {
        console.error('Error generating commissions report:', error);
        res.status(500).send('Error generating commissions report');
    }
});

router.get('/reportFines', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('property', 'location.address')
            .populate('buyer', 'username')
            .populate('seller', 'username');
        
        res.render('reportFines', { transactions });
    } catch (error) {
        console.error('Error generating fines report:', error);
        res.status(500).send('Error generating fines report');
    }
});

router.get('/reportTaxes', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('property', 'location.address location.country')
            .populate('buyer', 'username')
            .populate('seller', 'username');
        
        res.render('reportTaxes', { transactions });
    } catch (error) {
        console.error('Error generating taxes report:', error);
        res.status(500).send('Error generating taxes report');
    }
});

module.exports = router;
