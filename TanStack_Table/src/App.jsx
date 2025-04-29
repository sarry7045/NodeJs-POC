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
  Collapse,
} from "antd";
import {
  SearchOutlined,
  SettingOutlined,
  PushpinOutlined,
  SortAscendingOutlined,
  SwapOutlined,
  UserOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;
const { Panel } = Collapse;
const generatePerson = () => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 80 }),
  city: faker.location.city(),
  country: faker.location.country(),
  salary: faker.number.int({ min: 30000, max: 150000 }),
  bonus: faker.number.int({ min: 0, max: 20000 }),
  department: faker.helpers.arrayElement([
    "IT",
    "HR",
    "Sales",
    "Marketing",
    "Engineering",
  ]),
  jobTitle: faker.person.jobTitle(),
  startDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
  status: faker.helpers.arrayElement(["Active", "On Leave", "Terminated"]),
  manager: faker.person.fullName(),
  projects: faker.number.int({ min: 1, max: 10 }),
});

const data = Array.from({ length: 100 }, generatePerson);
function SortableTableHeader({ header, isPinned = false, pinnedOffset = 0 }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 100 : isPinned ? 50 : 0,
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned ? `${pinnedOffset}px` : undefined,
    background: isPinned ? '#fafafa' : '#fafafa',
    borderRight: isPinned ? '1px solid #f0f0f0' : undefined,
  };

  return (
    <th
      ref={setNodeRef}
      style={{
        ...style,
        width: header.getSize(),
        padding: "12px",
        borderBottom: "1px solid #f0f0f0",
        textAlign: "left",
      }}
      {...attributes}
    >
      <div
        {...{
          className: header.column.getCanSort()
            ? "cursor-pointer select-none"
            : "",
          onClick: header.column.getToggleSortingHandler(),
        }}
      >
        <div {...listeners} style={{ cursor: isDragging ? 'grabbing' : 'grab', display: 'inline-block' }}>
          {flexRender(
            header.column.columnDef.header,
            header.getContext()
          )}
        </div>
        <span className="ml-2">
          {{
            asc: "↑",
            desc: "↓",
          }[header.column.getIsSorted()] ?? null}
        </span>
      </div>
    </th>
  );
}

function App() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [frozenColumns, setFrozenColumns] = useState(['firstName', 'lastName']); // Default frozen columns
  const [activeId, setActiveId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const columnGroups = useMemo(() => ({
    fullName: {
      id: 'fullName',
      title: 'Full Name',
      icon: <UserOutlined />,
      columns: [
        {
          accessorKey: "firstName",
          header: "First Name",
          size: 150,
        },
        {
          accessorKey: "lastName",
          header: "Last Name",
          size: 150,
        }
      ]
    },
    personalInfo: {
      id: 'personalInfo',
      title: 'Personal Info',
      icon: <UserOutlined />,
      columns: [
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
          accessorKey: "country",
          header: "Country",
          size: 150,
        }
      ]
    },
    employment: {
      id: 'employment',
      title: 'Employment',
      icon: <BarsOutlined />,
      columns: [
        {
          accessorKey: "department",
          header: "Department",
          size: 150,
        },
        {
          accessorKey: "jobTitle",
          header: "Job Title",
          size: 200,
        },
        {
          accessorKey: "startDate",
          header: "Start Date",
          size: 120,
        },
        {
          accessorKey: "status",
          header: "Status",
          size: 120,
        }
      ]
    },
    financial: {
      id: 'financial',
      title: 'Financial',
      icon: <BarsOutlined />,
      columns: [
        {
          accessorKey: "salary",
          header: "Salary",
          size: 150,
          cell: ({ getValue }) => formatter.format(getValue()),
        },
        {
          accessorKey: "bonus",
          header: "Bonus",
          size: 150,
          cell: ({ getValue }) => formatter.format(getValue()),
        }
      ]
    },
    additional: {
      id: 'additional',
      title: 'Additional Info',
      icon: <BarsOutlined />,
      columns: [
        {
          accessorKey: "manager",
          header: "Manager",
          size: 180,
        },
        {
          accessorKey: "projects",
          header: "Projects",
          size: 100,
        }
      ]
    }
  }), []);

  // Create grouped columns structure for react-table
  const groupedColumns = useMemo(() => [
    {
      header: "Full Name",
      columns: columnGroups.fullName.columns,
    },
    {
      header: "Personal Info",
      columns: columnGroups.personalInfo.columns,
    },
    {
      header: "Employment",
      columns: columnGroups.employment.columns,
    },
    {
      header: "Financial",
      columns: columnGroups.financial.columns,
    },
    {
      header: "Additional Info",
      columns: columnGroups.additional.columns,
    }
  ], [columnGroups]);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const table = useReactTable({
    data,
    columns: groupedColumns,
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const pinnedOffsets = useMemo(() => {
    const offsets = {};
    let currentOffset = 0;
    
    table.getAllLeafColumns().forEach(column => {
      if (frozenColumns.includes(column.id)) {
        offsets[column.id] = currentOffset;
        currentOffset += column.getSize();
      }
    });
    
    return offsets;
  }, [frozenColumns, table.getAllLeafColumns()]);

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

  const columnManagementItems = Object.values(columnGroups).map(group => ({
    key: group.id,
    label: (
      <Collapse bordered={false} defaultActiveKey={Object.keys(columnGroups)}>
        <Panel 
          header={
            <Space>
              {group.icon}
              <span>{group.title}</span>
            </Space>
          } 
          key={group.id}
          showArrow={false}
          style={{ background: 'transparent' }}
        >
          {group.columns.map(column => {
            const tableColumn = table.getAllLeafColumns().find(c => c.id === column.accessorKey);
            return tableColumn ? (
              <div key={column.accessorKey} style={{ padding: '8px 0' }}>
                <Space>
                  <Checkbox
                    checked={tableColumn.getIsVisible()}
                    onChange={(e) => {
                      tableColumn.toggleVisibility(e.target.checked);
                      e.stopPropagation();
                    }}
                  >
                    {column.header}
                  </Checkbox>
                  <Space>
                    <Tooltip title="Freeze Column">
                      <Button
                        icon={<PushpinOutlined />}
                        size="small"
                        type={frozenColumns.includes(column.accessorKey) ? "primary" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (frozenColumns.includes(column.accessorKey)) {
                            setFrozenColumns(
                              frozenColumns.filter((id) => id !== column.accessorKey)
                            );
                          } else {
                            setFrozenColumns([...frozenColumns, column.accessorKey]);
                          }
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Sort Column">
                      <Button
                        icon={<SortAscendingOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          tableColumn.toggleSorting();
                        }}
                      />
                    </Tooltip>
                  </Space>
                </Space>
              </div>
            ) : null;
          })}
        </Panel>
      </Collapse>
    ),
  }));

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id);
        const newIndex = columnOrder.indexOf(over.id);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  }

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
              open={dropdownOpen}
              onOpenChange={(open) => setDropdownOpen(open)}
              menu={{
                items: columnManagementItems,
                onClick: (e) => e.domEvent.stopPropagation()
              }}
              trigger={["click"]}
              dropdownRender={(menu) => (
                <div 
                  style={{ width: 350, maxHeight: '60vh', overflowY: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {menu}
                </div>
              )}
            >
              <Button icon={<SettingOutlined />}>Column Management</Button>
            </Dropdown>
            <Tooltip title="Shuffle Columns">
              <Button icon={<SwapOutlined />} onClick={shuffleColumns} />
            </Tooltip>
          </Space>
        </Space>

        <div className="overflow-x-auto" style={{ position: 'relative' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="w-full" style={{ minWidth: 'max-content' }}>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      <SortableContext 
                        items={columnOrder.length ? columnOrder : table.getAllLeafColumns().map(col => col.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map((header) => {
                          if (header.isPlaceholder) {
                            return null;
                          }
                          return (
                            <SortableTableHeader 
                              key={header.id} 
                              header={header} 
                              isPinned={frozenColumns.includes(header.column.id)}
                              pinnedOffset={pinnedOffsets[header.column.id]}
                            />
                          );
                        })}
                      </SortableContext>
                    </tr>
                  ))}
                </thead>
                <DragOverlay>
                  {activeId ? (
                    <th
                      style={{
                        padding: "12px",
                        background: "#fafafa",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "left",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                      }}
                    >
                      {table.getAllLeafColumns().find(col => col.id === activeId)?.columnDef.header}
                    </th>
                  ) : null}
                </DragOverlay>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => {
                        const isPinned = frozenColumns.includes(cell.column.id);
                        return (
                          <td
                            key={cell.id}
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #f0f0f0",
                              position: isPinned ? 'sticky' : undefined,
                              left: isPinned ? `${pinnedOffsets[cell.column.id]}px` : undefined,
                              background: isPinned ? 'white' : undefined,
                              zIndex: isPinned ? 10 : undefined,
                              borderRight: isPinned ? '1px solid #f0f0f0' : undefined,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DndContext>
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