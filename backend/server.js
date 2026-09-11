require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const morgan     = require("morgan");
const helmet     = require("helmet");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const axios      = require("axios");

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ─── DB Connect ───────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((e) => { console.error(e); process.exit(1); });

// ─── Models ───────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", UserSchema);

const RecommendationSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    input:      { type: Object, required: true },
    career:     { type: String, required: true },
    confidence: { type: Number, required: true },
    top_5:      [{ career: String, confidence: Number }],
}, { timestamps: true });

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);

// ─── Helpers ──────────────────────────────────────────────
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const protect = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
        next();
    } catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const ok  = (res, data, message = "Success", status = 200) =>
    res.status(status).json({ success: true, message, data });

const err = (res, message = "Error", status = 400) =>
    res.status(status).json({ success: false, message });

// ─── Auth Routes ──────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return err(res, "Name, email and password are required");
    if (await User.findOne({ email }))
        return err(res, "Email already registered", 409);
    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);
    ok(res, { user: { _id: user._id, name: user.name, email: user.email }, token }, "Registered", 201);
});

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return err(res, "Email and password required");
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
        return err(res, "Invalid email or password", 401);
    const token = signToken(user._id);
    ok(res, { user: { _id: user._id, name: user.name, email: user.email }, token });
});

// ─── Recommend Routes ─────────────────────────────────────
const REQUIRED = ["gender","ug_degree","specialization","interests","skills","cgpa","has_certification","is_working"];

app.post("/api/recommend", protect, async (req, res) => {
    const missing = REQUIRED.filter((f) => !req.body[f] && req.body[f] !== 0);
    if (missing.length) return err(res, `Missing fields: ${missing.join(", ")}`);
    try {
        const { data } = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, req.body, { timeout: 10000 });
        const rec = await Recommendation.create({
            userId:     req.user._id,
            input:      req.body,
            career:     data.career,
            confidence: data.confidence,
            top_5:      data.top_5,
        });
        ok(res, rec);
    } catch (e) {
        err(res, e.response?.data?.detail || "ML service unavailable", 503);
    }
});

app.get("/api/recommend/history", protect, async (req, res) => {
    const records = await Recommendation.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
    ok(res, records);
});

// ─── Profile Route ────────────────────────────────────────
app.get("/api/profile", protect, (req, res) => {
    ok(res, req.user);
});

// ─── Health ───────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", service: "CareerAI Backend" }));

// ─── 404 ──────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ success: false, message: "Route not found" }));

// ─── Error Handler ────────────────────────────────────────
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────
app.listen(process.env.PORT, () => {
    console.log(`Backend running on http://localhost:${process.env.PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});