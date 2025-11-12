import React, { useState, useMemo } from "react";
import { dealsData, getSummaryStats } from "./data";

const DealsDashboard = () => {
  const [filterPOC, setFilterPOC] = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table"); // 'table', 'summary', 'byPOC', 'byCreator', 'byCampaign'
  const [sortBy, setSortBy] = useState("dealSize");
  const [sortOrder, setSortOrder] = useState("desc");

  const summaryStats = getSummaryStats();

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = dealsData;

    if (filterPOC) {
      filtered = filtered.filter((deal) => deal.poc === filterPOC);
    }
    if (filterCreator) {
      filtered = filtered.filter((deal) => deal.creatorName === filterCreator);
    }
    if (filterCampaign) {
      filtered = filtered.filter((deal) => deal.campaign === filterCampaign);
    }
    if (searchTerm) {
      filtered = filtered.filter((deal) =>
        Object.values(deal).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [filterPOC, filterCreator, filterCampaign, searchTerm, sortBy, sortOrder]);

  // Calculate totals for filtered data
  const filteredTotal = filteredData.reduce(
    (sum, deal) => sum + deal.dealSize,
    0
  );

  // Group data by POC
  const dataByPOC = useMemo(() => {
    const grouped = {};
    filteredData.forEach((deal) => {
      if (!grouped[deal.poc]) {
        grouped[deal.poc] = [];
      }
      grouped[deal.poc].push(deal);
    });
    return Object.entries(grouped)
      .map(([poc, deals]) => ({
        poc,
        deals: deals.length,
        totalAmount: deals.reduce((sum, deal) => sum + deal.dealSize, 0),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredData]);

  // Helper function to categorize platform
  const categorizePlatform = (deliverable) => {
    const lowerDeliverable = deliverable.toLowerCase();
    if (lowerDeliverable.includes("yt") || lowerDeliverable.includes("youtube")) {
      return "YouTube";
    } else if (lowerDeliverable.includes("ig") || lowerDeliverable.includes("insta")) {
      if (lowerDeliverable.includes("story")) {
        return "Instagram - Story";
      } else if (lowerDeliverable.includes("reel")) {
        return "Instagram - Reels";
      } else if (lowerDeliverable.includes("post")) {
        return "Instagram - Post";
      }
      return "Instagram - Other";
    }
    return "Other";
  };

  // Group data by Creator
  const dataByCreator = useMemo(() => {
    const grouped = {};
    filteredData.forEach((deal) => {
      if (!grouped[deal.creatorName]) {
        grouped[deal.creatorName] = {
          deals: [],
          youtube: { deals: 0, amount: 0 },
          instagramReels: { deals: 0, amount: 0 },
          instagramStory: { deals: 0, amount: 0 },
          instagramPost: { deals: 0, amount: 0 },
          instagramOther: { deals: 0, amount: 0 },
          other: { deals: 0, amount: 0 },
        };
      }
      grouped[deal.creatorName].deals.push(deal);

      const platform = categorizePlatform(deal.deliverables);
      if (platform === "YouTube") {
        grouped[deal.creatorName].youtube.deals++;
        grouped[deal.creatorName].youtube.amount += deal.dealSize;
      } else if (platform === "Instagram - Reels") {
        grouped[deal.creatorName].instagramReels.deals++;
        grouped[deal.creatorName].instagramReels.amount += deal.dealSize;
      } else if (platform === "Instagram - Story") {
        grouped[deal.creatorName].instagramStory.deals++;
        grouped[deal.creatorName].instagramStory.amount += deal.dealSize;
      } else if (platform === "Instagram - Post") {
        grouped[deal.creatorName].instagramPost.deals++;
        grouped[deal.creatorName].instagramPost.amount += deal.dealSize;
      } else if (platform === "Instagram - Other") {
        grouped[deal.creatorName].instagramOther.deals++;
        grouped[deal.creatorName].instagramOther.amount += deal.dealSize;
      } else {
        grouped[deal.creatorName].other.deals++;
        grouped[deal.creatorName].other.amount += deal.dealSize;
      }
    });
    return Object.entries(grouped)
      .map(([creator, data]) => ({
        creator,
        deals: data.deals.length,
        totalAmount: data.deals.reduce((sum, deal) => sum + deal.dealSize, 0),
        youtube: data.youtube,
        instagramReels: data.instagramReels,
        instagramStory: data.instagramStory,
        instagramPost: data.instagramPost,
        instagramOther: data.instagramOther,
        other: data.other,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredData]);

  // Group data by Campaign
  const dataByCampaign = useMemo(() => {
    const grouped = {};
    filteredData.forEach((deal) => {
      if (!grouped[deal.campaign]) {
        grouped[deal.campaign] = [];
      }
      grouped[deal.campaign].push(deal);
    });
    return Object.entries(grouped)
      .map(([campaign, deals]) => ({
        campaign,
        deals: deals.length,
        totalAmount: deals.reduce((sum, deal) => sum + deal.dealSize, 0),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredData]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const resetFilters = () => {
    setFilterPOC("");
    setFilterCreator("");
    setFilterCampaign("");
    setSearchTerm("");
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#333", marginBottom: "30px" }}>Deals Dashboard</h1>

      {/* View Selector */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setView("table")}
          style={{
            padding: "10px 20px",
            backgroundColor: view === "table" ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📊 All Deals
        </button>
        <button
          onClick={() => setView("summary")}
          style={{
            padding: "10px 20px",
            backgroundColor: view === "summary" ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📈 Summary
        </button>
        <button
          onClick={() => setView("byPOC")}
          style={{
            padding: "10px 20px",
            backgroundColor: view === "byPOC" ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          👤 By POC
        </button>
        <button
          onClick={() => setView("byCreator")}
          style={{
            padding: "10px 20px",
            backgroundColor: view === "byCreator" ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🎨 By Creator
        </button>
        <button
          onClick={() => setView("byCampaign")}
          style={{
            padding: "10px 20px",
            backgroundColor: view === "byCampaign" ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🎯 By Campaign
        </button>
      </div>

      {/* Filters */}
      {view === "table" && (
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Filters</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Search:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search all fields..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                POC:
              </label>
              <select
                value={filterPOC}
                onChange={(e) => setFilterPOC(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">All POCs</option>
                {summaryStats.pocList.map((poc) => (
                  <option key={poc} value={poc}>
                    {poc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Creator:
              </label>
              <select
                value={filterCreator}
                onChange={(e) => setFilterCreator(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">All Creators</option>
                {summaryStats.creatorList.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Campaign:
              </label>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">All Campaigns</option>
                {summaryStats.campaignList.map((campaign) => (
                  <option key={campaign} value={campaign}>
                    {campaign}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={resetFilters}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Summary View */}
      {view === "summary" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#1976d2" }}>
                Total Deals
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                {summaryStats.totalDeals}
              </p>
            </div>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#388e3c" }}>
                Total Value
              </h3>
              <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                {formatCurrency(summaryStats.totalDealSize)}
              </p>
            </div>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff3e0",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#f57c00" }}>
                Unique POCs
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                {summaryStats.uniquePOCs}
              </p>
            </div>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fce4ec",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#c2185b" }}>
                Unique Creators
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                {summaryStats.uniqueCreators}
              </p>
            </div>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f3e5f5",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#7b1fa2" }}>
                Unique Campaigns
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                {summaryStats.uniqueCampaigns}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* By POC View */}
      {view === "byPOC" && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>POC</th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Number of Deals
                </th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {dataByPOC.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  }}
                >
                  <td style={{ padding: "12px" }}>{item.poc}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.deals}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* By Creator View */}
      {view === "byCreator" && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#28a745", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Creator</th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Total Deals
                </th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Total Amount
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    backgroundColor: "#dc3545",
                  }}
                >
                  YouTube
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    backgroundColor: "#e91e63",
                  }}
                >
                  IG Reels
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    backgroundColor: "#9c27b0",
                  }}
                >
                  IG Story
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    backgroundColor: "#673ab7",
                  }}
                >
                  IG Post
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    backgroundColor: "#6c757d",
                  }}
                >
                  Other
                </th>
              </tr>
            </thead>
            <tbody>
              {dataByCreator.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  }}
                >
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {item.creator}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.deals}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "#28a745",
                    }}
                  >
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.youtube.deals > 0 ? (
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {item.youtube.deals} deals
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatCurrency(item.youtube.amount)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.instagramReels.deals > 0 ? (
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {item.instagramReels.deals} deals
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatCurrency(item.instagramReels.amount)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.instagramStory.deals > 0 ? (
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {item.instagramStory.deals} deals
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatCurrency(item.instagramStory.amount)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.instagramPost.deals > 0 ? (
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {item.instagramPost.deals} deals
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatCurrency(item.instagramPost.amount)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {(item.instagramOther.deals > 0 || item.other.deals > 0) ? (
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {item.instagramOther.deals + item.other.deals} deals
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatCurrency(item.instagramOther.amount + item.other.amount)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* By Campaign View */}
      {view === "byCampaign" && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#ffc107", color: "#333" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Campaign</th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Number of Deals
                </th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {dataByCampaign.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  }}
                >
                  <td style={{ padding: "12px" }}>{item.campaign}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {item.deals}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div>
          <div
            style={{
              marginBottom: "15px",
              padding: "15px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
            }}
          >
            <strong>Showing {filteredData.length} deals</strong> |
            <strong> Total: {formatCurrency(filteredTotal)}</strong>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#343a40", color: "white" }}>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSortBy("poc");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    POC {sortBy === "poc" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSortBy("creatorName");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Creator{" "}
                    {sortBy === "creatorName" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSortBy("campaign");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Campaign{" "}
                    {sortBy === "campaign" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Agency</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Deliverables
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Link</th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "right",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSortBy("dealSize");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Deal Size{" "}
                    {sortBy === "dealSize" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((deal, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{deal.poc}</td>
                    <td style={{ padding: "10px" }}>{deal.creatorName}</td>
                    <td style={{ padding: "10px" }}>{deal.campaign}</td>
                    <td style={{ padding: "10px" }}>{deal.agency}</td>
                    <td style={{ padding: "10px" }}>{deal.deliverables}</td>
                    <td style={{ padding: "10px" }}>
                      {deal.link &&
                      deal.link !== "NA" &&
                      deal.link !== "Yet to share link" &&
                      deal.link !== "Brand Deal Screenshots" ? (
                        <a
                          href={deal.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#007bff", textDecoration: "none" }}
                        >
                          View
                        </a>
                      ) : (
                        <span style={{ color: "#6c757d" }}>
                          {deal.link || "-"}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(deal.dealSize)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsDashboard;
