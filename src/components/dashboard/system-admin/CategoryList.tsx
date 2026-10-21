"use client";

import {FormEvent, useMemo, useState} from "react";
import {Danger, Edit, ElementPlus, Trash} from "iconsax-react";
import { X } from "lucide-react";

import SmallTableDynamic, {type ColumnDef,} from "@/components/dashboard/SmallTableDynamic";

import {PaginationTable} from "@/components/dashboard/moderator/PaginationTable";
import {Button} from "@/components/ui/button";
import {Category} from "@/types/admin.type";
import {createCategories, deleteCategories, updateCategories,} from "@/services/admin.service";
import Toast from "@/components/modals/Toast";
import { useDebounce } from "@/hooks/useDebounce";

interface CategoryProps {
  categories: Category[];
  accessToken: string;
}

export default function CategoryList({
  categories,
  accessToken,
}: CategoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 11;

  const [categoryData, setCategoryData] = useState<Category[]>(categories);

  const [isOpen, setIsOpen] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");

  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const filteredCategories = useMemo(() => {
    return categoryData.filter((cat) =>
      cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );
  }, [categoryData, debouncedSearchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const handleOpenCreate = () => {
    setEditCategory(null);
    setNewCategoryName("");
    setIsOpen(true);
  };
  const handleOpenEdit = (category: Category) => {
    setEditCategory(category);
    setNewCategoryName(category.name);
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditCategory(null);
    setNewCategoryName("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = newCategoryName.trim();

    if (!trimmed) return;

    try {
      if (editCategory) {
        await updateCategories(accessToken, editCategory.categoryId, trimmed);

        setCategoryData((prev) =>
          prev.map((cat) =>
            cat.categoryId === editCategory.categoryId
              ? { ...cat, name: trimmed }
              : cat,
          ),
        );

        setToast({
          show: true,
          title: "Update Successful",
          message: `Category successfully renamed to "${trimmed}".`,
          type: "success",
        });
      } else {
        const response = await createCategories(accessToken, trimmed);
        const newCategoryItem: Category = {
          categoryId: response.categoryId || Math.random().toString(),
          name: trimmed,
          totalCount: 0,
        };

        setCategoryData((prev) => [...prev, newCategoryItem]);
        setToast({
          show: true,
          title: "Create Successful",
          message: `Category "${trimmed}" has been created successfully.`,
          type: "success",
        });
      }

      handleCloseForm();
    } catch (error) {
      console.error(error);
      setToast({
        show: true,
        title: editCategory ? "Update Failed" : "Create Failed",
        message: editCategory
          ? "Could not update the category. Please try again."
          : "Could not create the category. Please try again.",
        type: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategory) return;

    const deletedName = deleteCategory.name;

    try {
      await deleteCategories(accessToken, deleteCategory.categoryId);
      setCategoryData((prev) =>
        prev.filter((cat) => cat.categoryId !== deleteCategory.categoryId),
      );

      setToast({
        show: true,
        title: "Delete Successful",
        message: `Category "${deletedName}" was removed completely.`,
        type: "success",
      });

      setDeleteCategory(null);
    } catch (error) {
      console.error("Failed to delete:", error);

      setToast({
        show: true,
        title: "Delete Failed",
        message: "An error occurred while deleting the category.",
        type: "error",
      });
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      header: "Category Name",
      accessorKey: "name",
      width: "70%",
      render: (row) => <p>{row.name}</p>,
    },
    {
      header: "Action",
      width: "30%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="cursor-pointer"
          >
            <Edit size={18} color="#38bdf8" />
          </button>

          {/* <button
            type="button"
            onClick={() => setDeleteCategory(row)}
            className="cursor-pointer"
          >
            <Trash size={18} color="#fb7185" />
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl box-shadow flex flex-col h-full relative">
      {/* TITLE */}
      <h2 className="text-lg font-bold secondary-color mb-4 shrink-0">
        Category
      </h2>

      {/* SEARCH + CREATE */}
      <div className="flex justify-between pb-4 gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search category"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);

              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-(--secondary-color) outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
          />
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-9 rounded-xl bg-(--main-color) px-3 text-white hover:bg-(--main-color)/80 cursor-pointer"
        >
          + Create
        </Button>
      </div>

      {/* TABLE */}
      <div className="flex flex-col h-full min-h-0 justify-between">
        <SmallTableDynamic data={paginatedData} columns={columns} />

        <div className="pt-6 shrink-0">
          <PaginationTable
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            compact
          />
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-105 rounded-[24px] p-6 shadow-xl relative animate-in fade-in slide-in-from-bottom-6 duration-300">
            {/* CLOSE */}
            <button
              type="button"
              onClick={handleCloseForm}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center text-center"
            >
              <div className="h-14 w-14 bg-(--main-color)/10 text-(--main-color) rounded-full flex items-center justify-center mb-4">
                <ElementPlus size={25} color="currentColor" />
              </div>

              <h3 className="text-(--secondary-color) text-xl font-bold mb-1">
                {editCategory ? "Edit Category" : "Create Category"}
              </h3>

              <p className="text-gray-400 text-sm mb-6">
                {editCategory
                  ? "Please enter the new category name"
                  : "Please enter the category name"}
              </p>

              <input
                type="text"
                required
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl text-center text-sm focus:outline-none focus:border-(--main-color) text-black mb-6 placeholder-gray-300"
              />

              <button
                type="submit"
                className="w-32 py-2.5 bg-(--main-color) text-white rounded-xl text-sm font-semibold hover:bg-(--main-color)/80 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                {editCategory ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-97.5 rounded-[24px] p-6 shadow-xl relative text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-300">
            <button
              type="button"
              onClick={() => setDeleteCategory(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="h-14 w-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Danger size={25} color="currentColor" />
            </div>

            <h3 className="text-(--secondary-color) text-xl font-bold mb-2">
              Delete Category
            </h3>

            <p className="text-gray-400 text-sm mb-6 px-2">
              You&#39;re going to delete category named{" "}
              <span className="font-semibold text-(--secondary-color)">
                {deleteCategory.name}
              </span>
              . Are you sure?
            </p>

            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setDeleteCategory(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {toast?.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onCloseAction={() => setToast(null)}
        />
      )}
    </div>
  );
}
