const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para Famosos
const famousSchema = new Schema({
  name: { type: String, required: true },
  nationality: { type: String, required: true },
  birthDate: { type: Date, required: true }
});

// Esquema para Usuarios
const userSchema = new Schema({
  username: { type: String, required: true },
  name: { type: String },
  password: { type: String, required: true },
});

// Esquema para Propiedades
const propertySchema = new Schema({
  type: { type: String, required: true }, // Casa, Apartamento, Estudio, Terreno
  location: { 
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true }
  },
  description: { type: String },
  estimatedPrice: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  forSale: { type: Boolean, default: true }
});

// Esquema para Transacciones
const transactionSchema = new Schema({
  type: { type: String, required: true }, // Compra, Venta, Subasta
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  date: { type: Date, default: Date.now },
  salePrice: { type: Number, required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User' },
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  bankId: { type: Schema.Types.ObjectId, ref: 'Bank' }, // Referencia a Bancos
  currency: { type: String, enum: ['EUR', 'USD', 'COP'], required: true },
  commission: { type: Number, required: true },
  taxes: { type: Number, required: true },
  fines: { type: Number, default: 0 }
});


// Esquema para Bancos
const bankSchema = new Schema({
  name: { type: String, required: true },
  headquartersLocation: { type: String, required: true }
});

// Esquema para Subastas
const auctionSchema = new Schema({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  startPrice: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: Schema.Types.ObjectId, ref: 'User' },
  endTime: { type: Date, required: true },
  bids: [
    {
      bidder: { type: Schema.Types.ObjectId, ref: 'User' },
      amount: { type: Number, required: true },
      bidTime: { type: Date, default: Date.now }
    }
  ]
});

// Modelos
const Famous = mongoose.model("Famous", famousSchema);
const User = mongoose.model("User", userSchema);
const Property = mongoose.model("Property", propertySchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Bank = mongoose.model("Bank", bankSchema);
const Auction = mongoose.model("Auction", auctionSchema);

module.exports = { Famous, User, Property, Transaction, Bank, Auction };

