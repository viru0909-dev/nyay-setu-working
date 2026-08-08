import { Search, Filter } from "lucide-react";

export default function AdvancedCaseSearch({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    caseTypeFilter,
    setCaseTypeFilter,
    dateFilter,
    setDateFilter,
    recentSearches,
    showSuggestions,
    setShowSuggestions,
    clearFilters
}) {
    return (
        <div
            style={{
                background: "var(--bg-glass-strong)",
                backdropFilter: "var(--glass-blur)",
                border: "var(--border-glass)",
                borderRadius: "1rem",
                padding: "1rem 1.5rem",
                marginBottom: "2rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
                <Search
                    size={18}
                    color="#64748b"
                    style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                />

                <input
                    type="text"
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                    }
                    style={{
                        width: "100%",
                        padding: "0.8rem 1rem 0.8rem 3rem",
                        background: "var(--bg-glass)",
                        border: "var(--border-glass)",
                        borderRadius: "0.75rem",
                        color: "var(--text-main)",
                        outline: "none",
                    }}
                />

                {/* Recent Suggestions */}
                {showSuggestions && recentSearches.length > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            top: "110%",
                            left: 0,
                            right: 0,
                            background: "var(--bg-glass-strong)",
                            border: "var(--border-glass)",
                            borderRadius: "0.75rem",
                            padding: "0.5rem",
                            zIndex: 100,
                        }}
                    >
                        <p
                            style={{
                                margin: "0.5rem",
                                color: "var(--text-secondary)",
                                fontSize: "0.8rem",
                            }}
                        >
                            Recent Searches
                        </p>

                        {recentSearches.map((item) => (
                            <div
                                key={item}
                                onClick={() => {
                                    setSearchTerm(item);
                                    setShowSuggestions(false);
                                }}
                                style={{
                                    padding: "0.7rem",
                                    cursor: "pointer",
                                    borderRadius: "0.5rem",
                                }}
                            >
                                🔍 {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Filter size={18} color="#64748b" />

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: "0.8rem",
                        borderRadius: "0.75rem",
                        background: "var(--bg-glass)",
                        border: "var(--border-glass)",
                        color: "var(--text-main)",
                    }}
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            {/* Case Type Filter */}
            <select
                value={caseTypeFilter}
                onChange={(e) => setCaseTypeFilter(e.target.value)}
                style={{
                    padding: "0.8rem",
                    borderRadius: "0.75rem",
                    background: "var(--bg-glass)",
                    border: "var(--border-glass)",
                    color: "var(--text-main)",
                }}
            >
                <option value="ALL">All Case Types</option>
                <option value="CIVIL">Civil</option>
                <option value="CRIMINAL">Criminal</option>
                <option value="PROPERTY">Property</option>
                <option value="FAMILY">Family</option>
            </select>

            {/* Date Filter */}
            <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                    padding: "0.8rem",
                    borderRadius: "0.75rem",
                    background: "var(--bg-glass)",
                    border: "var(--border-glass)",
                    color: "var(--text-main)",
                }}
            />

            {/* Clear Button */}
            <button
                onClick={clearFilters}
                style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "0.8rem 1rem",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                    fontWeight: "600",
                }}
            >
                Clear Filters
            </button>
        </div>
    );
}