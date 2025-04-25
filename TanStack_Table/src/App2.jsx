import { useState, useEffect } from "react";

const App2 = () => {
  // Sample data
  const generateData = () => {
    return Array(100)
      .fill(0)
      .map((_, index) => ({
        id: index + 1,
        firstName: [
          "John",
          "Jane",
          "Alex",
          "Michael",
          "Emma",
          "Chris",
          "Sarah",
          "David",
        ][Math.floor(Math.random() * 8)],
        lastName: [
          "Smith",
          "Johnson",
          "Williams",
          "Brown",
          "Jones",
          "Garcia",
          "Miller",
          "Davis",
        ][Math.floor(Math.random() * 8)],
        age: Math.floor(Math.random() * 50) + 18,
        visits: Math.floor(Math.random() * 100),
        status: ["Active", "Inactive", "Pending"][
          Math.floor(Math.random() * 3)
        ],
        progress: Math.floor(Math.random() * 100),
      }));
  };

  // State for table data and features
  const [data, setData] = useState(generateData);
  const [displayData, setDisplayData] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    firstName: true,
    lastName: true,
    age: true,
    visits: true,
    status: true,
    progress: true,
  });
  const [columnOrder, setColumnOrder] = useState([
    "id",
    "firstName",
    "lastName",
    "age",
    "visits",
    "status",
    "progress",
  ]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [pinnedRows, setPinnedRows] = useState([]);

  // Column group definitions
  const columnGroups = [
    {
      id: "fullName",
      header: "Full Name",
      columns: ["firstName", "lastName"],
    },
    {
      id: "others",
      header: "Others",
      columns: ["id", "age", "visits", "status", "progress"],
    },
  ];

  // Column definitions
  const columns = [
    { id: "id", header: "ID", frozen: true, group: "others" },
    { id: "firstName", header: "First Name", group: "fullName" },
    { id: "lastName", header: "Last Name", group: "fullName" },
    { id: "age", header: "Age", group: "others" },
    { id: "visits", header: "Visits", group: "others" },
    { id: "status", header: "Status", group: "others" },
    { id: "progress", header: "Progress", group: "others" },
  ];

  // Filter data based on global and column filters
  const filterData = (dataToFilter) => {
    return dataToFilter.filter((row) => {
      // Apply global filter
      if (globalFilter) {
        const matchesGlobal = Object.values(row).some((value) =>
          String(value).toLowerCase().includes(globalFilter.toLowerCase())
        );
        if (!matchesGlobal) return false;
      }

      // Apply column filters
      for (const key in filters) {
        if (
          filters[key] &&
          String(row[key]).toLowerCase().indexOf(filters[key].toLowerCase()) ===
            -1
        ) {
          return false;
        }
      }

      return true;
    });
  };

  // Sort data by column
  const sortData = (dataToSort) => {
    if (sortConfig.key) {
      return [...dataToSort].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return dataToSort;
  };

  // Get paginated data
  const getPaginatedData = () => {
    // Filter out already pinned rows
    const unpinnedData = displayData.filter(
      (row) => !pinnedRows.includes(row.id)
    );
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return unpinnedData.slice(startIndex, endIndex);
  };

  // Process data when filters, sort or page changes
  useEffect(() => {
    let result = filterData(data);
    result = sortData(result);
    setDisplayData(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [data, globalFilter, filters, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Handle column filter change
  const handleFilterChange = (columnId, value) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Handle column drag start
  const handleDragStart = (e, columnId) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
    // Add a ghost image
    const ghost = document.createElement("div");
    ghost.className = "bg-blue-100 p-2 rounded";
    ghost.textContent = columnId;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  // Handle column drop
  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    if (draggedColumn === targetColumnId) return;

    const newColumnOrder = [...columnOrder];
    const draggedIndex = newColumnOrder.indexOf(draggedColumn);
    const targetIndex = newColumnOrder.indexOf(targetColumnId);

    newColumnOrder.splice(draggedIndex, 1);
    newColumnOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newColumnOrder);
    setDraggedColumn(null);
  };

  // Allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Toggle pin row
  const togglePinRow = (rowId) => {
    setPinnedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };

  // Calculate total pages (accounting for pinned rows)
  const unpinnedRowCount = displayData.filter(
    (row) => !pinnedRows.includes(row.id)
  ).length;
  const totalPages = Math.ceil(unpinnedRowCount / pageSize);
  const paginatedData = getPaginatedData();
  const pinnedRowsData = displayData.filter((row) =>
    pinnedRows.includes(row.id)
  );

  // Get visible columns by group
  const getVisibleColumnsByGroup = () => {
    const groupMap = {};
    columnGroups.forEach((group) => {
      groupMap[group.id] = {
        header: group.header,
        columns: group.columns.filter((colId) => visibleColumns[colId]),
      };
    });
    return groupMap;
  };

  const visibleColumnGroups = getVisibleColumnsByGroup();

  // Get column by ID
  const getColumnById = (columnId) => {
    return columns.find((col) => col.id === columnId);
  };

  // Render cell content based on column type
  const renderCellContent = (row, columnId) => {
    switch (columnId) {
      case "status":
        return (
          <span
            className={`inline-block px-2 py-1 rounded ${
              row.status === "Active"
                ? "bg-green-100 text-green-800"
                : row.status === "Inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.status}
          </span>
        );
      case "progress":
        return (
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-600 h-4 rounded"
              style={{ width: `${row.progress}%` }}
            ></div>
          </div>
        );
      default:
        return row[columnId];
    }
  };

  return (
    <div className="p-4 max-w-full">
      <h1 className="text-2xl font-bold mb-4">Advanced React Table</h1>

      {/* Global search */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>

      {/* Column visibility control */}
      <div className="mb-4 p-2 border border-gray-200 rounded bg-gray-50">
        <h3 className="font-semibold mb-2">Toggle Columns:</h3>
        <div className="flex flex-wrap gap-4">
          {columnGroups.map((group) => (
            <div key={group.id} className="border-l-2 border-blue-300 pl-2">
              <h4 className="font-medium mb-1">{group.header}</h4>
              <div className="flex flex-wrap gap-2">
                {group.columns.map((columnId) => {
                  const column = getColumnById(columnId);
                  return (
                    <div key={columnId} className="flex items-center">
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={visibleColumns[columnId]}
                          onChange={() => toggleColumnVisibility(columnId)}
                        />
                        <span>{column.header}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table container with horizontal scroll */}
      <div className="border border-gray-300 rounded overflow-x-auto">
        <table className="min-w-full bg-white">
          {/* Column Group Header */}
          <thead>
            <tr>
              {/* Add pin column header */}
              <th
                className="p-2 bg-gray-100 border border-gray-300 w-12"
                rowSpan="2"
              >
                Pin
              </th>

              {columnGroups.map((group) => {
                // Calculate column span - only count visible columns
                const visibleColumnsInGroup = group.columns.filter(
                  (colId) => visibleColumns[colId]
                );
                if (visibleColumnsInGroup.length === 0) return null;

                return (
                  <th
                    key={group.id}
                    colSpan={visibleColumnsInGroup.length}
                    className="p-2 bg-gray-200 border border-gray-300 text-center font-bold"
                  >
                    {group.header}
                  </th>
                );
              })}
            </tr>

            {/* Column Headers */}
            <tr>
              {columnOrder
                .filter((columnId) => visibleColumns[columnId])
                .map((columnId) => {
                  const column = getColumnById(columnId);
                  return (
                    <th
                      key={column.id}
                      className={`p-2 select-none bg-gray-100 border border-gray-300 cursor-pointer ${
                        draggedColumn === column.id ? "bg-blue-100" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, column.id)}
                      onDrop={(e) => handleDrop(e, column.id)}
                      onDragOver={handleDragOver}
                      onClick={() => handleSort(column.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{column.header}</span>
                        {sortConfig.key === column.id && (
                          <span>
                            {sortConfig.direction === "ascending"
                              ? " 🔼"
                              : " 🔽"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
            </tr>

            {/* Filter row */}
            <tr>
              {/* Pin column filter - empty cell */}
              <th className="p-2 border border-gray-300"></th>

              {columnOrder
                .filter((columnId) => visibleColumns[columnId])
                .map((columnId) => (
                  <th
                    key={`filter-${columnId}`}
                    className="p-2 border border-gray-300"
                  >
                    <input
                      type="text"
                      value={filters[columnId] || ""}
                      onChange={(e) =>
                        handleFilterChange(columnId, e.target.value)
                      }
                      placeholder={`Search...`}
                      className="w-full p-1 border border-gray-300 rounded"
                    />
                  </th>
                ))}
            </tr>
          </thead>

          {/* Pinned rows - fixed at the top during scroll */}
          {pinnedRowsData.length > 0 && (
            <thead className="sticky top-0 z-20 bg-blue-50">
              {pinnedRowsData.map((row) => (
                <tr
                  key={`pinned-${row.id}`}
                  className="bg-blue-50 border-b-2 border-blue-200"
                >
                  {/* Pin/Unpin button */}
                  <td className="p-2 border border-gray-300 text-center">
                    <button
                      onClick={() => togglePinRow(row.id)}
                      className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center"
                      title="Unpin row"
                    >
                      📌
                    </button>
                  </td>

                  {columnOrder
                    .filter((columnId) => visibleColumns[columnId])
                    .map((columnId) => {
                      const column = getColumnById(columnId);
                      return (
                        <td
                          key={`pinned-${row.id}-${columnId}`}
                          className={`p-2 border border-gray-300 font-medium ${
                            column.frozen ? "sticky left-0 bg-blue-50 z-30" : ""
                          }`}
                        >
                          {renderCellContent(row, columnId)}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </thead>
          )}

          {/* Regular table body */}
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {/* Pin/Unpin button */}
                <td className="p-2 border border-gray-300 text-center">
                  <button
                    onClick={() => togglePinRow(row.id)}
                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    title="Pin row to top"
                  >
                    📍
                  </button>
                </td>

                {columnOrder
                  .filter((columnId) => visibleColumns[columnId])
                  .map((columnId) => {
                    const column = getColumnById(columnId);
                    return (
                      <td
                        key={`${row.id}-${columnId}`}
                        className={`p-2 border border-gray-300 ${
                          column.frozen ? "sticky left-0 bg-white z-10" : ""
                        }`}
                      >
                        {renderCellContent(row, columnId)}
                      </td>
                    );
                  })}
              </tr>
            ))}
            {paginatedData.length === 0 && !pinnedRowsData.length && (
              <tr>
                <td
                  colSpan={
                    columnOrder.filter((columnId) => visibleColumns[columnId])
                      .length + 1
                  }
                  className="p-4 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {currentPage} of {totalPages || 1}
          </strong>
        </span>

        <div className="flex items-center gap-2">
          <span>Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) : 1;
              setCurrentPage(Math.min(Math.max(1, page), totalPages));
            }}
            className="w-16 p-1 border border-gray-300 rounded"
          />
        </div>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="p-1 border border-gray-300 rounded"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Showing {paginatedData.length} rows per page ({pinnedRowsData.length}{" "}
        pinned rows + {paginatedData.length} regular rows)
        <br />
        Total: {displayData.length} rows (filtered from {data.length} total
        rows)
      </div>
    </div>
  );
};

export default App2;

// Claude version 1
