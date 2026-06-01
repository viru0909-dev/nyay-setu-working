import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Plus,
  Grid as GridIcon,
  List as ListIcon,
  Loader2,
  Users,
  Scale,
  X,
  Check,
  Award,
  Shield,
  AlertTriangle,
  Gavel,
} from "lucide-react";
import { caseAPI, clientFirAPI, caseAssignmentAPI } from "../../services/api";
import { FixedSizeList as List, FixedSizeGrid as Grid } from "react-window";
import { useTranslation } from "react-i18next";

const statusColors = {
  PENDING: { bg: "#f5930020", border: "#f59e0b", text: "#f59e0b" },
  OPEN: {
    bg: "rgba(30, 42, 68, 0.1)",
    border: "var(--color-primary)",
    text: "var(--color-primary)",
  },
  IN_PROGRESS: {
    bg: "rgba(30, 42, 68, 0.1)",
    border: "var(--color-primary)",
    text: "var(--color-primary)",
  },
  AWAITING_DOCUMENTS: { bg: "#ef444420", border: "#ef4444", text: "#ef4444" },
  COMPLETED: {
    bg: "rgba(16, 185, 129, 0.1)",
    border: "#10b981",
    text: "#10b981",
  },
  CLOSED: { bg: "#64748b20", border: "#64748b", text: "#64748b" },
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function CaseDiaryPage() {
  const [activeTab, setActiveTab] = useState("cases");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const { t } = useTranslation("litigant");

  const [cases, setCases] = useState([]);
  const [firs, setFirs] = useState([]);
  const [availableLawyers, setAvailableLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lawyerLoading, setLawyerLoading] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedCaseForLawyer, setSelectedCaseForLawyer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, firsRes] = await Promise.allSettled([
        caseAPI.list(),
        clientFirAPI.listFirs(),
      ]);
      if (casesRes.status === "fulfilled") setCases(casesRes.value.data || []);
      if (firsRes.status === "fulfilled") setFirs(firsRes.value.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleHireLawyer = async (caseItem) => {
    setSelectedCaseForLawyer(caseItem);
    setLawyerLoading(true);
    setShowHireModal(true);
    try {
      const res = await caseAssignmentAPI.getAvailableLawyers();
      setAvailableLawyers(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLawyerLoading(false);
  };

  const filteredItems = (activeTab === "cases" ? cases : firs).filter(
    (item) => {
      const title = item.title || item.caseTitle || "";
      const id = item.id?.toString() || "";
      const q = searchQuery.toLowerCase();
      const matches =
        title.toLowerCase().includes(q) || id.toLowerCase().includes(q);
      if (selectedStatus === "all") return matches;
      return matches && item.status === selectedStatus;
    },
  );

  // card renderer used by both list and grid cells
  const Card = ({ item }) => (
    <div
      style={{
        background: "var(--bg-glass-strong)",
        border: "var(--border-glass-strong)",
        borderRadius: "1rem",
        padding: "1.25rem",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            background: (statusColors[item.status] || statusColors["PENDING"])
              ?.bg,
            color: (statusColors[item.status] || statusColors["PENDING"])?.text,
            fontSize: "0.75rem",
            fontWeight: "700",
            border: `1px solid ${(statusColors[item.status] || statusColors["PENDING"])?.border}`,
          }}
        >
          {item.status
            ? t(`statuses.${item.status.toLowerCase()}`)
            : t("statuses.pending")}
        </span>
        {item.urgency === "CRITICAL" && (
          <AlertTriangle size={18} color="#ef4444" />
        )}
      </div>
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
        }}
      >
        {item.title}
      </h3>
      <div
        style={{
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
          marginBottom: "0.75rem",
        }}
      >
        {activeTab === "cases"
          ? item.caseType || t("caseDiary.noType")
          : t("caseDiary.policeFir")}{" "}
        • ID: {item.id}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#64748b",
          fontSize: "0.85rem",
        }}
      >
        <Calendar size={14} />
        {formatDate(item.createdAt || item.filedDate)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800" }}>
            {t("caseDiary.title")}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {t("caseDiary.subtitle")}
          </p>
        </div>
        <Link
          to="/litigant/file"
          style={{
            padding: "0.75rem 1.25rem",
            background: "var(--color-primary)",
            color: "white",
            borderRadius: "0.75rem",
            fontWeight: "700",
            display: "inline-flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <Plus size={18} />
          {t("caseDiary.fileNewCase")}
        </Link>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "var(--bg-glass-strong)",
          border: "var(--border-glass-strong)",
          borderRadius: "1rem",
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "cases"
                ? t("caseDiary.searchCasePlaceholder")
                : t("caseDiary.searchFirPlaceholder")
            }
            style={{ padding: "0.6rem 0.75rem 0.6rem 2.5rem", width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Filter size={18} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: "0.6rem" }}
          >
            <option value="all">{t("caseDiary.allStatuses")}</option>
            {[
              "PENDING",
              "OPEN",
              "IN_PROGRESS",
              "AWAITING_DOCUMENTS",
              "COMPLETED",
              "CLOSED",
            ].map((s) => (
              <option key={s} value={s}>
                {t(`statuses.${s.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "0.5rem",
              background:
                viewMode === "grid" ? "rgba(0,0,0,0.05)" : "transparent",
            }}
          >
            <GridIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "0.5rem",
              background:
                viewMode === "list" ? "rgba(0,0,0,0.05)" : "transparent",
            }}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <Loader2 size={36} className="animate-spin" />
          <div style={{ color: "var(--text-secondary)" }}>
            {t("caseDiary.loadingDiary")}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <div>{t("caseDiary.noEntries")}</div>
        </div>
      ) : viewMode === "list" ? (
        <List
          height={600}
          itemCount={filteredItems.length}
          itemSize={140}
          width={"100%"}
        >
          {({ index, style }) => {
            const item = filteredItems[index];
            return (
              <div
                style={{ ...style, padding: "0.5rem", boxSizing: "border-box" }}
                key={item.id}
              >
                <Card item={item} />
              </div>
            );
          }}
        </List>
      ) : (
        (() => {
          const containerWidth =
            typeof window !== "undefined"
              ? Math.min(1200, window.innerWidth)
              : 900;
          const colWidth = 320;
          const colCount = Math.max(1, Math.floor(containerWidth / colWidth));
          const rowCount = Math.ceil(filteredItems.length / colCount);
          const width = colCount * colWidth;
          return (
            <Grid
              columnCount={colCount}
              columnWidth={colWidth}
              height={600}
              rowCount={rowCount}
              rowHeight={260}
              width={width}
            >
              {({ columnIndex, rowIndex, style }) => {
                const idx = rowIndex * colCount + columnIndex;
                if (idx >= filteredItems.length) return <div style={style} />;
                const item = filteredItems[idx];
                return (
                  <div
                    style={{
                      ...style,
                      padding: "0.5rem",
                      boxSizing: "border-box",
                    }}
                    key={item.id}
                  >
                    <Card item={item} />
                  </div>
                );
              }}
            </Grid>
          );
        })()
      )}

      {/* Hire lawyer modal simplified for brevity */}
      {showHireModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowHireModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "1rem",
              width: "90%",
              maxWidth: "800px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>{t("lawyers.matchExperts")}</h3>
              <button onClick={() => setShowHireModal(false)}>
                <X />
              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              {lawyerLoading ? (
                <div>Loading...</div>
              ) : availableLawyers.length === 0 ? (
                <div>No lawyers</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {availableLawyers.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        border: "1px solid #eee",
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{l.name}</div>
                      <button
                        onClick={() => {
                          /* propose */
                        }}
                      >
                        Propose
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
