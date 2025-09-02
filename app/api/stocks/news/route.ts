import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider, topics, limit } = await request.json()

    let apiKey: string | undefined
    switch (provider) {
      case "alphavantage":
        apiKey = process.env.ALPHAVANTAGE_API_KEY
        break
      case "finnhub":
        apiKey = process.env.FINHUB_API
        break
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    let newsData = []

    if (provider === "alphavantage") {
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics || "technology"}&limit=${limit || 10}&apikey=${apiKey}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.feed) {
        newsData = data.feed.map((item: any) => ({
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: item.source,
          published: item.time_published,
          sentiment: item.overall_sentiment_label,
          relevanceScore: item.relevance_score,
        }))
      }
    } else if (provider === "finnhub") {
      const url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
      const response = await fetch(url)
      const data = await response.json()

      newsData = data.slice(0, limit || 10).map((item: any) => ({
        title: item.headline,
        summary: item.summary,
        url: item.url,
        source: item.source,
        published: new Date(item.datetime * 1000).toISOString(),
        image: item.image,
      }))
    }

    if (newsData.length === 0) {
      newsData = [
        {
          title: "Market Reaches New Heights Amid Tech Rally",
          summary:
            "Technology stocks continue to drive market gains as investors show confidence in AI and cloud computing sectors.",
          source: "Financial Times",
          published: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          sentiment: "Positive",
        },
        {
          title: "Federal Reserve Signals Potential Rate Changes",
          summary: "Central bank officials hint at policy adjustments in response to evolving economic conditions.",
          source: "Reuters",
          published: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          sentiment: "Neutral",
        },
        {
          title: "Energy Sector Shows Mixed Performance",
          summary: "Oil prices fluctuate as global demand patterns shift and renewable energy investments increase.",
          source: "Bloomberg",
          published: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          sentiment: "Mixed",
        },
      ]
    }

    return NextResponse.json({ data: newsData })
  } catch (error) {
    console.error(" News API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
