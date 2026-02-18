"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  actions?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  itemsPerPage?: number;
  /** Server-side pagination: total count from API */
  totalCount?: number;
  /** Server-side pagination: current page (1-based) */
  currentPage?: number;
  /** Server-side pagination: called when page changes */
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  pagination = true,
  itemsPerPage = 10,
  totalCount,
  currentPage: controlledPage,
  onPageChange,
}: DataTableProps<T>) {
  const t = useTranslations("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [internalPage, setInternalPage] = useState(1);

  const isServerSide = onPageChange !== undefined;
  const currentPage = isServerSide ? (controlledPage ?? 1) : internalPage;

  // Filter data based on search query (client-side only)
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const value = typeof col.key === "string" 
          ? row[col.key] 
          : row[col.key as keyof T];
        return String(value || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, columns]);

  // Pagination: server-side uses totalCount from API, client-side uses filteredData.length
  const totalCountOrFiltered = isServerSide ? (totalCount ?? 0) : filteredData.length;
  const totalPages = Math.ceil(totalCountOrFiltered / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = isServerSide
    ? filteredData // Server-side: data is already the current page, optionally filter by search
    : pagination
      ? filteredData.slice(startIndex, endIndex)
      : filteredData;

  // Reset to page 1 when search changes (client-side only)
  useMemo(() => {
    if (!isServerSide) setInternalPage(1);
  }, [searchQuery, isServerSide]);

  const handlePageChange = (page: number) => {
    if (isServerSide) {
      onPageChange?.(page);
    } else {
      setInternalPage(page);
    }
  };

  const renderCell = (column: Column<T>, row: T) => {
    const value =
      typeof column.key === "string"
        ? row[column.key]
        : row[column.key as keyof T];

    if (column.render) {
      return column.render(value, row);
    }

    return value != null ? String(value) : "-";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
              {columns.some(col => col.actions) && (
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                  {columns.some(col => col.actions) && (
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {columns
                          .filter(col => col.actions)
                          .map((column, idx) => (
                            <div key={idx}>{column.actions?.(row)}</div>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (columns.some(col => col.actions) ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {t("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - show when multiple pages, or in server-side mode with any data */}
      {pagination && (totalPages > 1 || (isServerSide && totalCountOrFiltered > 0)) && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700">
            {t("showing")} {totalCountOrFiltered > 0 ? startIndex + 1 : 0} {t("to")}{" "}
            {startIndex + paginatedData.length} {t("of")}{" "}
            {totalCountOrFiltered} {t("results")}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t("previous")}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

