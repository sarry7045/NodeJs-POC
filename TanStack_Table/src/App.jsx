import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { faker } from "@faker-js/faker";
import {
  Input,
  Button,
  Space,
  Card,
  Dropdown,
  Checkbox,
  Tooltip,
  Select,
  Typography,
  Tag,
} from "antd";
import {
  SearchOutlined,
  SettingOutlined,
  PushpinOutlined,
  SortAscendingOutlined,
  EyeOutlined,
  SwapOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Generate random data
const generatePerson = () => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 80 }),
  city: faker.location.city(),
  salary: faker.number.int({ min: 30000, max: 150000 }),
  department: faker.helpers.arrayElement([
    "IT",
    "HR",
    "Sales",
    "Marketing",
    "Engineering",
  ]),
});

const data = Array.from({ length: 100 }, generatePerson);

function App() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [frozenColumns, setFrozenColumns] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
        size: 150,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 250,
      },
      {
        accessorKey: "age",
        header: "Age",
        size: 100,
      },
      {
        accessorKey: "city",
        header: "City",
        size: 150,
      },
      {
        accessorKey: "salary",
        header: "Salary",
        size: 150,
        cell: ({ getValue }) => formatter.format(getValue()),
      },
      {
        accessorKey: "department",
        header: "Department",
        size: 150,
      },
    ],
    []
  );

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const shuffleColumns = () => {
    const currentColumns = [...table.getAllLeafColumns()];
    for (let i = currentColumns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentColumns[i], currentColumns[j]] = [
        currentColumns[j],
        currentColumns[i],
      ];
    }
    setColumnOrder(currentColumns.map((col) => col.id));
  };

  const columnManagementItems = table.getAllLeafColumns().map((column) => ({
    key: column.id,
    label: (
      <Space>
        <Checkbox
          checked={column.getIsVisible()}
          onChange={(e) => column.toggleVisibility(e.target.checked)}
        >
          {column.columnDef.header}
        </Checkbox>
        <Space>
          <Tooltip title="Freeze Column">
            <Button
              icon={<PushpinOutlined />}
              size="small"
              type={frozenColumns.includes(column.id) ? "primary" : "default"}
              onClick={() => {
                if (frozenColumns.includes(column.id)) {
                  setFrozenColumns(
                    frozenColumns.filter((id) => id !== column.id)
                  );
                } else {
                  setFrozenColumns([...frozenColumns, column.id]);
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Sort Column">
            <Button
              icon={<SortAscendingOutlined />}
              size="small"
              onClick={() => column.toggleSorting()}
            />
          </Tooltip>
        </Space>
      </Space>
    ),
  }));

  return (
    <Card className="m-4 p-16">
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Space className="justify-between w-full">
          <Title level={4}>Advanced Data Table</Title>
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Dropdown
              menu={{
                items: columnManagementItems,
              }}
              trigger={["click"]}
            >
              <Button icon={<SettingOutlined />}>Column Management</Button>
            </Dropdown>
            <Tooltip title="Shuffle Columns">
              <Button icon={<SwapOutlined />} onClick={shuffleColumns} />
            </Tooltip>
          </Space>
        </Space>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        position: "relative",
                        width: header.getSize(),
                        padding: "12px",
                        background: "#fafafa",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "left",
                        ...(frozenColumns.includes(header.column.id) && {
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          background: "#fafafa",
                        }),
                      }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-2">
                          {{
                            asc: "↑",
                            desc: "↓",
                          }[header.column.getIsSorted()] ?? null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #f0f0f0",
                        ...(frozenColumns.includes(cell.column.id) && {
                          position: "sticky",
                          left: 0,
                          background: "white",
                          zIndex: 1,
                        }),
                      }}
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
        </div>

        <Space className="justify-between w-full">
          <Space>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(value) => table.setPageSize(Number(value))}
              options={[10, 20, 30, 40, 50].map((pageSize) => ({
                label: `${pageSize} / page`,
                value: pageSize,
              }))}
            />
            <span>
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </span>
          </Space>
          <Space>
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </Space>
        </Space>
      </Space>
    </Card>
  );
}

export default App;
