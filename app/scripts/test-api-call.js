"use strict";
/**
 * 测试OpenAI API调用脚本
 *
 * 运行前请确保设置了环境变量:
 * OPENAI_API_KEY=你的OpenAI API密钥
 *
 * 运行方式:
 * npx ts-node app/scripts/test-api-call.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var buildMonthlyReportPrompt_1 = require("../lib/buildMonthlyReportPrompt");
var buildForecastPrompt_1 = require("../lib/buildForecastPrompt");
var openai_1 = __importDefault(require("openai"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// 检查API密钥
if (!process.env.OPENAI_API_KEY) {
    console.error('错误: 请设置OPENAI_API_KEY环境变量');
    process.exit(1);
}
// 初始化OpenAI客户端
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// 创建测试输出目录
var testDir = path.join(__dirname, '../../test-output');
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}
// 模拟数据
var mockContext = {
    bazi: {
        yearPillar: '甲子',
        monthPillar: '丙午',
        dayPillar: '戊申'
    },
    currentMonth: {
        name: 'July',
        year: 2025,
        energyType: 'Passion',
        element: 'Fire'
    },
    userElements: {
        wood: 25,
        fire: 15,
        earth: 30,
        metal: 20,
        water: 10
    },
    currentYear: {
        pillar: '乙卯',
        zodiac: 'Rabbit'
    }
};
// 测试月度报告提示词
function testMonthlyReport() {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_1, completion, report, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n========= 测试月度报告API调用 =========');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    prompt_1 = (0, buildMonthlyReportPrompt_1.buildMonthlyReportPrompt)(mockContext);
                    console.log('生成提示词成功，长度:', prompt_1.length);
                    // 调用OpenAI API
                    console.log('正在调用OpenAI API...');
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: "gpt-4o-mini", // 使用可用的模型
                            messages: [
                                {
                                    role: "system",
                                    content: "你是一位专业的能量咨询师，擅长分析能量和提供指导。"
                                },
                                {
                                    role: "user",
                                    content: prompt_1
                                }
                            ],
                            temperature: 0.7,
                        })];
                case 2:
                    completion = _a.sent();
                    report = completion.choices[0].message.content || '';
                    console.log('API调用成功，响应长度:', report.length);
                    // 保存结果
                    fs.writeFileSync(path.join(testDir, 'monthly-report-response.md'), report);
                    console.log('已保存响应到:', path.join(testDir, 'monthly-report-response.md'));
                    return [2 /*return*/, true];
                case 3:
                    error_1 = _a.sent();
                    console.error('月度报告API调用失败:', error_1);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// 测试年度报告提示词
function testForecastReport() {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_2, completion, report, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n========= 测试订阅用户年度报告API调用 =========');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    prompt_2 = (0, buildForecastPrompt_1.buildForecastPrompt)(mockContext, true);
                    console.log('生成提示词成功，长度:', prompt_2.length);
                    // 调用OpenAI API
                    console.log('正在调用OpenAI API...');
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: "gpt-4o-mini", // 使用可用的模型
                            messages: [
                                {
                                    role: "system",
                                    content: "你是一位专业的能量咨询师，擅长分析能量和提供指导。"
                                },
                                {
                                    role: "user",
                                    content: prompt_2
                                }
                            ],
                            temperature: 0.7,
                        })];
                case 2:
                    completion = _a.sent();
                    report = completion.choices[0].message.content || '';
                    console.log('API调用成功，响应长度:', report.length);
                    // 保存结果
                    fs.writeFileSync(path.join(testDir, 'yearly-report-response.md'), report);
                    console.log('已保存响应到:', path.join(testDir, 'yearly-report-response.md'));
                    return [2 /*return*/, true];
                case 3:
                    error_2 = _a.sent();
                    console.error('年度报告API调用失败:', error_2);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// 运行测试
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var monthlySuccess, forecastSuccess;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('开始测试OpenAI API调用...');
                    return [4 /*yield*/, testMonthlyReport()];
                case 1:
                    monthlySuccess = _a.sent();
                    return [4 /*yield*/, testForecastReport()];
                case 2:
                    forecastSuccess = _a.sent();
                    if (monthlySuccess && forecastSuccess) {
                        console.log('\n🎉 所有API测试成功完成！');
                        console.log('你可以在 test-output 目录下查看生成的报告。');
                    }
                    else {
                        console.log('\n⚠️ 部分测试失败，请检查错误信息。');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// 执行测试
runTests();
