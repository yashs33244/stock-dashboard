import { NextRequest, NextResponse } from 'next/server'
import { detectRateLimit } from '@/lib/rate-limit-detector'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const function_name = searchParams.get('function')
        const symbol = searchParams.get('symbol')

        if (!function_name || !symbol) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // Get API key based on provider
        let apiKey = process.env.ALPHAVANTAGE_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 })
        }

        // Build Alpha Vantage URL
        const params = new URLSearchParams({
            function: function_name,
            symbol: symbol,
            apikey: apiKey
        })

        const url = `https://www.alphavantage.co/query?${params.toString()}`

        const response = await fetch(url)
        const data = await response.json()

        // Check for rate limiting
        const rateLimitInfo = detectRateLimit(response, data)
        let isRateLimited = rateLimitInfo.isRateLimited
        let rateLimitMessage = rateLimitInfo.message || ""

        // Handle rate limiting or API errors
        if (isRateLimited || data['Error Message'] || data['Note']) {
            isRateLimited = true
            rateLimitMessage = data['Error Message'] || data['Note'] || "Rate limit exceeded"

            // Return mock fundamental data
            const mockData = generateMockFundamentalData(function_name, symbol)

            return NextResponse.json({
                data: mockData,
                isMockData: true,
                rateLimitMessage: rateLimitMessage
            })
        }

        // Process successful response
        const fundamentalData = processFundamentalData(data, function_name)

        return NextResponse.json({
            data: fundamentalData,
            isMockData: false,
            rateLimitMessage: undefined
        })

    } catch (error) {
        console.error(" Fundamental data API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function processFundamentalData(data: any, function_name: string): any {
    switch (function_name) {
        case 'OVERVIEW':
            return {
                symbol: data.Symbol,
                name: data.Name,
                description: data.Description,
                sector: data.Sector,
                industry: data.Industry,
                marketCap: data.MarketCapitalization,
                peRatio: data.PERatio,
                pegRatio: data.PEGRatio,
                bookValue: data.BookValue,
                dividendPerShare: data.DividendPerShare,
                dividendYield: data.DividendYield,
                eps: data.EPS,
                revenuePerShareTTM: data.RevenuePerShareTTM,
                profitMargin: data.ProfitMargin,
                operatingMarginTTM: data.OperatingMarginTTM,
                returnOnAssetsTTM: data.ReturnOnAssetsTTM,
                returnOnEquityTTM: data.ReturnOnEquityTTM,
                quarterlyEarningsGrowthYOY: data.QuarterlyEarningsGrowthYOY,
                quarterlyRevenueGrowthYOY: data.QuarterlyRevenueGrowthYOY,
                analystTargetPrice: data.AnalystTargetPrice,
                trailingPE: data.TrailingPE,
                forwardPE: data.ForwardPE,
                priceToSalesRatioTTM: data.PriceToSalesRatioTTM,
                priceToBookRatio: data.PriceToBookRatio,
                evToRevenue: data.EVToRevenue,
                evToEBITDA: data.EVToEBITDA,
                beta: data.Beta,
                week52High: data['52WeekHigh'],
                week52Low: data['52WeekLow'],
                day50MovingAverage: data['50DayMovingAverage'],
                day200MovingAverage: data['200DayMovingAverage'],
                sharesOutstanding: data.SharesOutstanding,
                dividendDate: data.DividendDate,
                exDividendDate: data.ExDividendDate
            }

        case 'EARNINGS':
            return {
                symbol: data.symbol,
                annualEarnings: data.annualEarnings || [],
                quarterlyEarnings: data.quarterlyEarnings || []
            }

        case 'INCOME_STATEMENT':
            return {
                symbol: data.symbol,
                annualReports: data.annualReports || [],
                quarterlyReports: data.quarterlyReports || []
            }

        case 'BALANCE_SHEET':
            return {
                symbol: data.symbol,
                annualReports: data.annualReports || [],
                quarterlyReports: data.quarterlyReports || []
            }

        case 'CASH_FLOW':
            return {
                symbol: data.symbol,
                annualReports: data.annualReports || [],
                quarterlyReports: data.quarterlyReports || []
            }

        default:
            return data
    }
}

function generateMockFundamentalData(function_name: string, symbol: string): any {
    const now = new Date()

    switch (function_name) {
        case 'OVERVIEW':
            return {
                symbol: symbol,
                name: `${symbol} Inc.`,
                description: `A leading technology company specializing in innovative solutions.`,
                sector: "Technology",
                industry: "Software",
                marketCap: "2500000000000",
                peRatio: "25.5",
                pegRatio: "1.2",
                bookValue: "15.75",
                dividendPerShare: "0.88",
                dividendYield: "0.0035",
                eps: "6.15",
                revenuePerShareTTM: "25.40",
                profitMargin: "0.242",
                operatingMarginTTM: "0.298",
                returnOnAssetsTTM: "0.185",
                returnOnEquityTTM: "0.390",
                quarterlyEarningsGrowthYOY: "0.125",
                quarterlyRevenueGrowthYOY: "0.085",
                analystTargetPrice: "180.00",
                trailingPE: "25.5",
                forwardPE: "23.8",
                priceToSalesRatioTTM: "7.2",
                priceToBookRatio: "11.4",
                evToRevenue: "7.8",
                evToEBITDA: "18.5",
                beta: "1.15",
                week52High: "182.94",
                week52Low: "124.17",
                day50MovingAverage: "165.20",
                day200MovingAverage: "155.80",
                sharesOutstanding: "15728700000",
                dividendDate: "2024-02-15",
                exDividendDate: "2024-02-09"
            }

        case 'EARNINGS':
            return {
                symbol: symbol,
                annualEarnings: [
                    { fiscalDateEnding: "2023-12-31", reportedEPS: "6.15" },
                    { fiscalDateEnding: "2022-12-31", reportedEPS: "5.61" },
                    { fiscalDateEnding: "2021-12-31", reportedEPS: "5.11" }
                ],
                quarterlyEarnings: [
                    { fiscalDateEnding: "2023-12-31", reportedDate: "2024-01-25", reportedEPS: "2.18", estimatedEPS: "2.10", surprise: "0.08", surprisePercentage: "3.81" },
                    { fiscalDateEnding: "2023-09-30", reportedDate: "2023-10-26", reportedEPS: "1.46", estimatedEPS: "1.39", surprise: "0.07", surprisePercentage: "5.04" }
                ]
            }

        case 'INCOME_STATEMENT':
            return {
                symbol: symbol,
                annualReports: [
                    {
                        fiscalDateEnding: "2023-12-31",
                        totalRevenue: "383285000000",
                        totalOperatingExpense: "271000000000",
                        costOfRevenue: "214137000000",
                        grossProfit: "169148000000",
                        ebit: "112301000000",
                        ebitda: "130541000000",
                        depreciation: "11010000000",
                        depreciationAndAmortization: "11010000000",
                        incomeBeforeTax: "110301000000",
                        incomeTaxExpense: "16741000000",
                        interestIncome: "3001000000",
                        interestExpense: "3933000000",
                        netInterestIncome: "-932000000",
                        otherOperatingExpense: "0",
                        operatingIncome: "112301000000",
                        totalOtherIncomeExpenseNet: "-2000000000",
                        netIncome: "96995000000"
                    }
                ],
                quarterlyReports: []
            }

        case 'BALANCE_SHEET':
            return {
                symbol: symbol,
                annualReports: [
                    {
                        fiscalDateEnding: "2023-12-31",
                        totalAssets: "352755000000",
                        totalCurrentAssets: "143566000000",
                        cashAndCashEquivalentsAtCarryingValue: "29558000000",
                        cashAndShortTermInvestments: "29558000000",
                        inventory: "6331000000",
                        currentNetReceivables: "29508000000",
                        totalNonCurrentAssets: "209189000000",
                        propertyPlantEquipment: "43667000000",
                        accumulatedDepreciationAmortizationPPE: "0",
                        intangibleAssets: "0",
                        intangibleAssetsExcludingGoodwill: "0",
                        goodwill: "0",
                        investments: "100544000000",
                        longTermInvestments: "100544000000",
                        shortTermInvestments: "0",
                        otherCurrentAssets: "0",
                        otherNonCurrentAssets: "0",
                        totalLiabilities: "258549000000",
                        totalCurrentLiabilities: "133973000000",
                        currentAccountsPayable: "58146000000",
                        deferredRevenue: "0",
                        currentDebt: "0",
                        shortTermDebt: "0",
                        totalNonCurrentLiabilities: "124576000000",
                        capitalLeaseObligations: "0",
                        longTermDebt: "95057000000",
                        currentLongTermDebt: "0",
                        longTermDebtNoncurrent: "95057000000",
                        shortLongTermDebtTotal: "95057000000",
                        otherCurrentLiabilities: "0",
                        otherNonCurrentLiabilities: "0",
                        totalShareholderEquity: "94206000000",
                        treasuryStock: "0",
                        retainedEarnings: "0",
                        commonStock: "0",
                        commonStockSharesOutstanding: "15728700000"
                    }
                ],
                quarterlyReports: []
            }

        case 'CASH_FLOW':
            return {
                symbol: symbol,
                annualReports: [
                    {
                        fiscalDateEnding: "2023-12-31",
                        reportedCurrency: "USD",
                        operatingCashflow: "110543000000",
                        paymentsForOperatingActivities: "0",
                        proceedsFromOperatingActivities: "0",
                        changeInOperatingLiabilities: "0",
                        changeInOperatingAssets: "0",
                        depreciationDepletionAndAmortization: "11010000000",
                        capitalExpenditures: "-109559000000",
                        changeInReceivables: "0",
                        changeInInventory: "0",
                        profitLoss: "96995000000",
                        cashflowFromInvestment: "-109559000000",
                        cashflowFromFinancing: "-110748000000",
                        proceedsFromRepaymentsOfShortTermDebt: "0",
                        paymentsForRepurchaseOfCommonStock: "77500000000",
                        paymentsForRepurchaseOfEquity: "77500000000",
                        paymentsForRepurchaseOfPreferredStock: "0",
                        dividendPayout: "0",
                        dividendPayoutCommonStock: "0",
                        dividendPayoutPreferredStock: "0",
                        proceedsFromIssuanceOfCommonStock: "0",
                        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: "0",
                        proceedsFromIssuanceOfPreferredStock: "0",
                        proceedsFromRepurchaseOfEquity: "0",
                        proceedsFromSaleOfTreasuryStock: "0",
                        changeInCashAndCashEquivalents: "0",
                        changeInExchangeRate: "0",
                        netIncome: "96995000000"
                    }
                ],
                quarterlyReports: []
            }

        default:
            return {
                symbol: symbol,
                message: `Mock data for ${function_name} function`
            }
    }
}
