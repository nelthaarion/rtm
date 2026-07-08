"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seed script: generates synthetic but realistic EURUSD OHLCV data
 * across 5 timeframes (M15, H1, H4, D1, W1) for the past 2 years.
 *
 * The generator produces trends, pullbacks, bases, and impulse moves
 * so that all RTM concepts (zones, FTRs, QMs, sweeps) are visible
 * in the data and labelable.
 *
 * Run with: bun run scripts/seed-ohlcv.ts
 */
var db_1 = require("../src/lib/db");
var INSTRUMENTS = [
    { symbol: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'FX', pipSize: 0.0001 },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar', assetClass: 'FX', pipSize: 0.0001 },
    { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', assetClass: 'CRYPTO', pipSize: 0.01 },
];
var TIMEFRAMES = ['M15', 'H1', 'H4', 'D1'];
// Generates a single timeframe's bars from a base price using a
// multi-regime random walk: trending + mean-reverting + ranging.
function generateBars(basePrice, barCount, intervalMs, startTime, volatility, pipSize) {
    var bars = [];
    var price = basePrice;
    var regime = 'trend_up';
    var regimeBars = 0;
    var regimeLength = 60 + Math.floor(Math.random() * 80);
    var trendStrength = 0.0001 + Math.random() * 0.0002;
    for (var i = 0; i < barCount; i++) {
        var timestamp = new Date(startTime.getTime() + i * intervalMs);
        // Regime switching
        regimeBars++;
        if (regimeBars >= regimeLength) {
            var r = Math.random();
            regime = r < 0.4 ? 'trend_up' : r < 0.8 ? 'trend_down' : 'range';
            regimeBars = 0;
            regimeLength = 60 + Math.floor(Math.random() * 80);
            trendStrength = 0.00005 + Math.random() * 0.0003;
        }
        // Mean drift by regime
        var drift = 0;
        if (regime === 'trend_up')
            drift = trendStrength;
        else if (regime === 'trend_down')
            drift = -trendStrength;
        else
            drift = (basePrice - price) * 0.001; // mean-reverting pull
        // Random shock with occasional impulse (5% chance of 3x volatility)
        var isImpulse = Math.random() < 0.05;
        var shock = (Math.random() - 0.5) * volatility * (isImpulse ? 3 : 1);
        var open_1 = price;
        var close_1 = Math.max(pipSize, price + drift + shock);
        var range = volatility * (0.5 + Math.random()) * (isImpulse ? 0.5 : 1);
        var high = Math.max(open_1, close_1) + Math.random() * range;
        var low = Math.min(open_1, close_1) - Math.random() * range;
        var volume = 1000 + Math.random() * 5000 + (isImpulse ? 5000 : 0);
        bars.push({ timestamp: timestamp, open: open_1, high: high, low: low, close: close_1, volume: volume });
        price = close_1;
    }
    return bars;
}
function timeframeToMs(tf) {
    switch (tf) {
        case 'M15': return 15 * 60 * 1000;
        case 'H1': return 60 * 60 * 1000;
        case 'H4': return 4 * 60 * 60 * 1000;
        case 'D1': return 24 * 60 * 60 * 1000;
        case 'W1': return 7 * 24 * 60 * 60 * 1000;
        default: return 60 * 60 * 1000;
    }
}
function barCountForTimeframe(tf) {
    switch (tf) {
        case 'M15': return 4000; // ~42 days
        case 'H1': return 3000; // ~125 days
        case 'H4': return 2000; // ~333 days
        case 'D1': return 730; // 2 years
        case 'W1': return 156; // 3 years
        default: return 1000;
    }
}
function volatilityForTimeframe(tf, base) {
    switch (tf) {
        case 'M15': return base * 0.0008;
        case 'H1': return base * 0.0016;
        case 'H4': return base * 0.0032;
        case 'D1': return base * 0.0070;
        case 'W1': return base * 0.0150;
        default: return base * 0.002;
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, _i, INSTRUMENTS_1, inst;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Clearing existing data...');
                    return [4 /*yield*/, db_1.db.bar.deleteMany({})];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.annotation.deleteMany({})];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.annotationSession.deleteMany({})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.instrument.deleteMany({})];
                case 4:
                    _a.sent();
                    _loop_1 = function (inst) {
                        var basePrice, instrument, now, _loop_2, _b, TIMEFRAMES_1, tf;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    basePrice = inst.assetClass === 'CRYPTO' ? 60000 :
                                        inst.symbol === 'GBPUSD' ? 1.2700 :
                                            1.0900;
                                    console.log("Seeding ".concat(inst.symbol, " (base ").concat(basePrice, ")..."));
                                    return [4 /*yield*/, db_1.db.instrument.create({
                                            data: {
                                                symbol: inst.symbol,
                                                name: inst.name,
                                                assetClass: inst.assetClass,
                                                pipSize: inst.pipSize,
                                            },
                                        })];
                                case 1:
                                    instrument = _c.sent();
                                    now = Date.now();
                                    _loop_2 = function (tf) {
                                        var intervalMs, count, vol, startTime, bars, BATCH, i, slice;
                                        return __generator(this, function (_d) {
                                            switch (_d.label) {
                                                case 0:
                                                    intervalMs = timeframeToMs(tf);
                                                    count = barCountForTimeframe(tf);
                                                    vol = volatilityForTimeframe(tf, basePrice);
                                                    startTime = new Date(now - intervalMs * count);
                                                    bars = generateBars(basePrice, count, intervalMs, startTime, vol, inst.pipSize);
                                                    BATCH = 200;
                                                    i = 0;
                                                    _d.label = 1;
                                                case 1:
                                                    if (!(i < bars.length)) return [3 /*break*/, 4];
                                                    slice = bars.slice(i, i + BATCH);
                                                    return [4 /*yield*/, db_1.db.bar.createMany({
                                                            data: slice.map(function (b) { return ({
                                                                instrumentId: instrument.id,
                                                                timeframe: tf,
                                                                timestamp: b.timestamp,
                                                                open: b.open,
                                                                high: b.high,
                                                                low: b.low,
                                                                close: b.close,
                                                                volume: b.volume,
                                                            }); }),
                                                        })];
                                                case 2:
                                                    _d.sent();
                                                    _d.label = 3;
                                                case 3:
                                                    i += BATCH;
                                                    return [3 /*break*/, 1];
                                                case 4:
                                                    console.log("  ".concat(tf, ": ").concat(bars.length, " bars"));
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _b = 0, TIMEFRAMES_1 = TIMEFRAMES;
                                    _c.label = 2;
                                case 2:
                                    if (!(_b < TIMEFRAMES_1.length)) return [3 /*break*/, 5];
                                    tf = TIMEFRAMES_1[_b];
                                    return [5 /*yield**/, _loop_2(tf)];
                                case 3:
                                    _c.sent();
                                    _c.label = 4;
                                case 4:
                                    _b++;
                                    return [3 /*break*/, 2];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, INSTRUMENTS_1 = INSTRUMENTS;
                    _a.label = 5;
                case 5:
                    if (!(_i < INSTRUMENTS_1.length)) return [3 /*break*/, 8];
                    inst = INSTRUMENTS_1[_i];
                    return [5 /*yield**/, _loop_1(inst)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('Done.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.db.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
