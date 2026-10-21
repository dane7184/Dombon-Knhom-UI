"use client";

import {Tabs} from "@/components/ui/tabs";
import {Dropdown} from "@/components/dashboard/moderator/Dropdown";
import {PaginationTable} from "@/components/dashboard/moderator/PaginationTable";
import ReportTable from "./ReportTable";
import DashboardTabs from "../DashboardTabs";
import {useMemo, useState} from "react";
import {ModReportManagement} from "@/types/moderator.type";

interface ReportManagementProps {
    reportManagement: ModReportManagement[];
}

export default function ReportManagement({reportManagement}: ReportManagementProps) {
    const [reportData, setReportData] = useState<ModReportManagement[]>(reportManagement);
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 11;
    const [activeTab, setActiveTab] = useState("all");
    const handleApproveAction = (targetReport: ModReportManagement) => {
        setReportData((prevItems) =>
            prevItems.map((item) =>
                item.reportId === targetReport.reportId ? {...item, status: "Approved"} : item
            )
        );
    };


    const handleRejectAction = (targetReport: ModReportManagement) => {
        setReportData((prevItems) =>
            prevItems.map((item) =>
                item.reportId === targetReport.reportId ? {...item, status: "Rejected"} : item
            )
        );
    };

    const sortedData = useMemo(() => {
        return [...reportData].sort((a, b) => {
            const timeA = a?.date ? new Date(a.date).getTime() : 0;
            const timeB = b?.date ? new Date(b.date).getTime() : 0;

            if (isNaN(timeA) || isNaN(timeB)) return 0;

            return sortBy === "newest" ? timeB - timeA : timeA - timeB;
        });
    }, [sortBy, reportData]);


    const currentTabPool = useMemo(() => {
        if (activeTab === "approved") {
            return sortedData.filter((item) => item.status === "Approved");
        }
        if (activeTab === "reject") {
            return sortedData.filter((item) => item.status === "Rejected");
        }
        if (activeTab === "all") {
            return sortedData;
        }
        return sortedData.filter((item) => item.status === "Pending");
    }, [sortedData, activeTab]);

    const totalPages = Math.ceil(currentTabPool.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const activePaginatedDataChunk = currentTabPool.slice(indexOfFirstItem, indexOfLastItem);

    const tabOptions = [
        {value: "all", label: "All"},
        {value: "approved", label: "Approved"},
        {value: "reject", label: "Rejected"},
    ];

    const sortOptions = [
        {value: "newest", label: "Newest"},
        {value: "oldest", label: "Oldest"},
    ];

    const handleTabToggle = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
    };

    return (
        <div className="bg-white h-full p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <Tabs
                value={activeTab}
                onValueChange={handleTabToggle}
                className="w-full flex-1 min-h-0 flex flex-col"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0">
                    <DashboardTabs options={tabOptions}/>

                    <div
                        className="flex gap-3 items-center w-full sm:w-auto justify-end text-sm font-medium text-(--text-desc)">
                        <p className="whitespace-nowrap text-md text-black">Sort by:</p>
                        <Dropdown
                            value={sortBy}
                            onChange={(val) => {
                                setSortBy(val as "newest" | "oldest");
                                setCurrentPage(1);
                            }}
                            options={sortOptions}
                        />
                    </div>
                </div>

                <div className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6">
                    <ReportTable
                        data={activePaginatedDataChunk}
                        activeTab={activeTab}
                        startIndex={indexOfFirstItem}
                        onApproveAction={handleApproveAction}
                        onRejectAction={handleRejectAction}
                    />
                </div>
            </Tabs>

            <div className="pt-6 border-t border-gray-50 shrink-0">
                <PaginationTable
                    totalItems={currentTabPool.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                        if (page <= totalPages && page >= 1) {
                            setCurrentPage(page);
                        }
                    }}
                />
            </div>
        </div>
    );
}