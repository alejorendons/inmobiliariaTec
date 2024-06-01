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

        res.render("properties", { properties, users });
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

// Mostrar formulario para agregar propiedad
router.get("/addProperty", async (req, res) => {
    try {
        const users = await User.find();
        res.render("addProperty", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error al obtener los usuarios");
    }
});

// Agregar propiedad
router.post("/addProperty", async (req, res) => {
    try {
        const { type, address, city, country, description, estimatedPrice, ownerId } = req.body;
        let property = new Property({
            type,
            location: {
                address,
                city,
                country
            },
            description,
            estimatedPrice,
            owner: new mongoose.Types.ObjectId(ownerId) // Asegurarse de que ownerId sea un ObjectId
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

        const buyer = await User.findById(buyerId);
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




module.exports = router;

