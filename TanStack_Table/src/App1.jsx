import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const App1 = () => {
  // Sample data
  const data = useMemo(
    () => [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        age: 28,
        status: "Active",
        lastVisit: "2023-05-15",
        role: "Admin",
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        age: 34,
        status: "Inactive",
        lastVisit: "2023-04-22",
        role: "User",
      },
      {
        id: 3,
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@example.com",
        age: 45,
        status: "Active",
        lastVisit: "2023-05-10",
        role: "Editor",
      },
      {
        id: 4,
        firstName: "Alice",
        lastName: "Brown",
        email: "alice@example.com",
        age: 30,
        status: "Pending",
        lastVisit: "2023-03-18",
        role: "User",
      },
      {
        id: 5,
        firstName: "Charlie",
        lastName: "Wilson",
        email: "charlie@example.com",
        age: 22,
        status: "Active",
        lastVisit: "2023-05-20",
        role: "User",
      },
      {
        id: 6,
        firstName: "Diana",
        lastName: "Miller",
        email: "diana@example.com",
        age: 40,
        status: "Inactive",
        lastVisit: "2023-01-05",
        role: "Editor",
      },
      {
        id: 7,
        firstName: "Evan",
        lastName: "Davis",
        email: "evan@example.com",
        age: 29,
        status: "Active",
        lastVisit: "2023-05-18",
        role: "Admin",
      },
      {
        id: 8,
        firstName: "Fiona",
        lastName: "Garcia",
        email: "fiona@example.com",
        age: 35,
        status: "Pending",
        lastVisit: "2023-04-30",
        role: "User",
      },
      {
        id: 9,
        firstName: "George",
        lastName: "Martinez",
        email: "george@example.com",
        age: 50,
        status: "Active",
        lastVisit: "2023-05-12",
        role: "Editor",
      },
      {
        id: 10,
        firstName: "Hannah",
        lastName: "Robinson",
        email: "hannah@example.com",
        age: 27,
        status: "Inactive",
        lastVisit: "2023-02-14",
        role: "User",
      },
      {
        id: 11,
        firstName: "Ian",
        lastName: "Clark",
        email: "ian@example.com",
        age: 33,
        status: "Active",
        lastVisit: "2023-05-22",
        role: "Admin",
      },
      {
        id: 12,
        firstName: "Jessica",
        lastName: "Rodriguez",
        email: "jessica@example.com",
        age: 38,
        status: "Pending",
        lastVisit: "2023-05-01",
        role: "User",
      },
    ],
    []
  );

  // Columns definition with 2 groups
  const columns = [
    {
      header: "Full Name",
      columns: [
        {
          accessorKey: "firstName",
          header: "First Name",
          size: 120,
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        },
        {
          accessorKey: "lastName",
          header: "Last Name",
          size: 120,
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        },
      ],
    },
    {
      header: "Details",
      columns: [
        {
          accessorKey: "id",
          header: "ID",
          size: 60,
          cell: (info) => (
            <button
              onClick={() => {
                const rowId = info.row.id;
                setRowPinning((prev) => ({
                  ...prev,
                  top: prev.top.includes(rowId)
                    ? prev.top.filter((id) => id !== rowId)
                    : [...prev.top, rowId],
                }));
              }}
              className={`w-full h-full flex items-center justify-center ${info.row.getIsPinned() ? "text-blue-600 font-bold" : ""}`}
            >
              {info.getValue()}
              {info.row.getIsPinned() && " ★"}
            </button>
          ),
        },
        {
          accessorKey: "email",
          header: "Email",
          size: 200,
        },
        {
          accessorKey: "age",
          header: "Age",
          size: 80,
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "Active"
                ? "green"
                : status === "Inactive"
                  ? "red"
                  : status === "Pending"
                    ? "orange"
                    : "gray";
            return <span style={{ color }}>{status}</span>;
          },
          size: 100,
        },
        {
          accessorKey: "lastVisit",
          header: "Last Visit",
          size: 120,
        },
        {
          accessorKey: "role",
          header: "Role",
          size: 100,
        },
      ],
    },
  ];

  // State for table features
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnPinning, setColumnPinning] = useState({ left: [], right: [] });
  const [rowPinning, setRowPinning] = useState({ top: [], bottom: [] });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnOrder,
      columnPinning,
      rowPinning,
      sorting,
      globalFilter,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onRowPinningChange: setRowPinning,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Handle column reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newColumnOrder = [...columnOrder];
    const [removed] = newColumnOrder.splice(result.source.index, 1);
    newColumnOrder.splice(result.destination.index, 0, removed);

    setColumnOrder(newColumnOrder);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Advanced Table with TanStack</h1>
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          className="p-2 border rounded w-full max-w-md"
        />
      </div>
      <div className="mb-4 p-2 border rounded">
        <h2 className="font-semibold mb-2">Visible Columns</h2>
        {table
          .getHeaderGroups()
          .filter((hg) => hg.headers[0].column.parent)
          .map((headerGroup) => (
            <div key={headerGroup.id} className="mb-3">
              <h3 className="font-medium mb-1">
                {headerGroup.headers[0].column.parent.header}
              </h3>
              <div className="flex flex-wrap gap-2">
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded"
                      />
                      <span>{column.columnDef.header}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Table */}
      <div className="border rounded overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns" direction="horizontal">
            {(provided) => (
              <table
                className="w-full"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => (
                        <Draggable
                          key={header.id}
                          draggableId={header.id}
                          index={index}
                        >
                          {(provided) => (
                            <th
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              key={header.id}
                              colSpan={header.colSpan}
                              style={{
                                width: header.getSize(),
                                position: header.column.getIsPinned()
                                  ? "sticky"
                                  : undefined,
                                left:
                                  header.column.getIsPinned() === "left"
                                    ? `${header.getStart()}px`
                                    : undefined,
                                right:
                                  header.column.getIsPinned() === "right"
                                    ? "0"
                                    : undefined,
                                backgroundColor: "white",
                                zIndex: header.column.getIsPinned() ? 1 : 0,
                              }}
                              className="border p-2 text-left bg-gray-100"
                            >
                              <div
                                className={`flex items-center ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: " 🔼",
                                  desc: " 🔽",
                                }[header.column.getIsSorted()] ?? null}
                              </div>
                              {header.column.getCanResize() && (
                                <div
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={`absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize select-none touch-none ${
                                    header.column.getIsResizing()
                                      ? "bg-blue-500"
                                      : ""
                                  }`}
                                />
                              )}
                            </th>
                          )}
                        </Draggable>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {/* Pinned rows (top) */}
                  {table.getTopRows().map((row) => (
                    <tr key={row.id} className="bg-blue-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            position: "sticky",
                            top: 0,
                            backgroundColor: "#f0f9ff",
                            zIndex: 2,
                          }}
                          className="border p-2"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Regular rows */}
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            position: cell.column.getIsPinned()
                              ? "sticky"
                              : undefined,
                            left:
                              cell.column.getIsPinned() === "left"
                                ? `${cell.column.getStart()}px`
                                : undefined,
                            right:
                              cell.column.getIsPinned() === "right"
                                ? "0"
                                : undefined,
                            backgroundColor: "white",
                            zIndex: cell.column.getIsPinned() ? 1 : 0,
                          }}
                          className="border p-2"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            className="border rounded p-1 px-2"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1 px-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1 px-2"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1 px-2"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>

        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="border rounded p-1"
        >
          {[5, 10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>

      {/* Row Count Info */}
      <div className="mt-2 text-sm text-gray-600">
        Showing {table.getRowModel().rows.length} of {data.length} rows
        {table.getTopRows().length > 0 &&
          ` (${table.getTopRows().length} pinned)`}
      </div>
    </div>
  );
};

export default App1;
