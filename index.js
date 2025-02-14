"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const router_1 = __importDefault(require("./src/router/router"));
const errorMiddleware_1 = require("./src/middlewares/errorMiddleware");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
console.log(process.env.PORT);
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '',
    credentials: true,
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || '');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
const logger = (0, morgan_1.default)("combined");
app.use(logger);
app.use((0, cookie_parser_1.default)());
app.use(router_1.default);
app.use(errorMiddleware_1.errorMiddleware);
const testSchema = new mongoose_1.default.Schema({
    news: String,
});
const TestModel = mongoose_1.default.model("test", testSchema);
mongoose_1.default
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("MongoDb connected"))
    .catch((err) => console.log(err));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
