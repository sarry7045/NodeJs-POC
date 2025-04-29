import { useState, useEffect } from "react";
import { Space, Select } from "antd";

const App3 = () => {
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
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

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
    { id: "progress", header: "Progress", group: "others" },
    { id: "progress", header: "Progress", group: "others" },
    { id: "progress", header: "Progress", group: "others" },
  ];

  // Filter data based on global and column filters
  const filterData = (dataToFilter) => {
    return dataToFilter.filter((row) => {
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

  // Process data when filters, sort or page changes
  useEffect(() => {
    let result = filterData(data);
    result = sortData(result);
    setDisplayData(result);
    setCurrentPage(1);
  }, [data, globalFilter, filters, sortConfig]);

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
            className={`px-2 py-1 rounded text-xs font-medium ${
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
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${row.progress}%` }}
            ></div>
          </div>
        );
      default:
        return row[columnId];
    }
  };

  return (
    <div className="p-6 max-w-full bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Advanced Table</h1>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5"
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2.5 inline-flex items-center"
            onClick={() => setColumnsMenuOpen(!columnsMenuOpen)}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            Advance Filters
          </button>

          {columnsMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
              <div className="p-2">
                {columnGroups.map((group) => (
                  <div key={group.id} className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-1 pb-1 border-b">
                      {group.header}
                    </h3>
                    <div className="space-y-1">
                      {group.columns.map((columnId) => {
                        const column = getColumnById(columnId);
                        return (
                          <label
                            key={columnId}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                              checked={visibleColumns[columnId]}
                              onChange={() => toggleColumnVisibility(columnId)}
                            />
                            <span className="text-sm text-gray-700">
                              {column.header}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto shadow-md sm:rounded-lg mb-6 border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3 bg-gray-50" rowSpan="2">
                Pin
              </th>

              {columnGroups.map((group) => {
                const visibleColumnsInGroup = group.columns.filter(
                  (colId) => visibleColumns[colId]
                );
                if (visibleColumnsInGroup.length === 0) return null;

                return (
                  <th
                    key={group.id}
                    colSpan={visibleColumnsInGroup.length}
                    className="px-6 py-3 text-center border bg-gray-100 border-b-2 border-gray-250"
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
                .map((columnId, index) => {
                  const column = getColumnById(columnId);
                  return (
                    <th
                      key={column.id}
                      className={`px-6 py-3 cursor-pointer select-none ${
                        sortConfig.key === column.id
                          ? "bg-blue-50"
                          : "bg-gray-50"
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, column.id)}
                      onDrop={(e) => handleDrop(e, column.id)}
                      onDragOver={handleDragOver}
                      onClick={() => handleSort(column.id)}
                      style={{
                        borderLeft: index === 0 ? "1px solid #E8E9EB" : "",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        {column.header}
                        <span>
                          {sortConfig.key === column.id &&
                            (sortConfig.direction === "ascending" ? (
                              <svg
                                className="w-3 h-3 ml-1"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-3 h-3 ml-1"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.426 19.926a6 6 0 1 1 1.5-7.32 5.324 5.324 0 0 0-1.5 3.695 5.356 5.356 0 0 0 1.5 3.695 7.723 7.723 0 0 1-1.5-.07Zm-12.4-3.095a1.995 1.995 0 0 1-1.108-3.25L7.34 9.158l4-2.308v4.623L7.918 13.8a1.988 1.988 0 0 1-2.892 3.03Z" />
                              </svg>
                            ))}
                        </span>
                      </div>
                    </th>
                  );
                })}
            </tr>

            <tr>
              <th className="px-6 py-3 bg-gray-50"></th>
              {columnOrder
                .filter((columnId) => visibleColumns[columnId])
                .map((columnId, index) => (
                  <th
                    key={`filter-${columnId}`}
                    className="px-3 py-2 bg-gray-50"
                    style={{
                      borderLeft: index === 0 ? "1px solid #E8E9EB" : "",
                    }}
                  >
                    <input
                      type="text"
                      value={filters[columnId] || ""}
                      onChange={(e) =>
                        handleFilterChange(columnId, e.target.value)
                      }
                      placeholder={`Filter ${columnId}...`}
                      style={{ fontWeight: 500 }}
                      className="w-full p-1 text-sm text-gray-600 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 size-8"
                    />
                  </th>
                ))}
            </tr>
          </thead>

          {/* Pinned rows - fixed at the top during scroll */}
          {pinnedRowsData.length > 0 && (
            <thead className="sticky top-0  bg-blue-50">
              {pinnedRowsData.map((row) => (
                <tr
                  key={`pinned-${row.id}`}
                  className="bg-blue-50 border-b-2 border-blue-200"
                >
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
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="p-2 border border-gray-300 text-center">
                  <button
                    onClick={() => togglePinRow(row.id)}
                    className="w-6 h-6 rounded bg-gray-400 hover:bg-gray-300 flex items-center justify-center"
                    title="Pin row to top"
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

        {/* <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {currentPage} of {totalPages || 1}
          </strong>
        </span> */}

        {/* <div className="flex items-center gap-2">
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
        </div> */}
        <Space>
          <Select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            options={[10, 20, 30, 40, 50].map((pageSize) => ({
              label: `${pageSize} / Page`,
              value: pageSize,
            }))}
          />
          <span>
            Page{" "}
            <strong>
              {currentPage} of {totalPages || 1}
            </strong>
          </span>
        </Space>
        {/* <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="p-1 border border-gray-300 rounded"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select> */}
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

export default App3;

// Claude version 2 - Suraj
