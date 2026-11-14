// @ts-nocheck
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { useProjectStore } from '@/store/projectStore';
import { getData, postData, deleteData, notify } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Eye, Edit2, Trash2, FolderPlus, Tag, Layers, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectCategories() {
  const user = useUserStore();
  const { categories, fetchCategories } = useProjectStore();

  const [loading, setLoading] = useState(false);
  const [catList, setCatList] = useState<any[]>([]);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected item state
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDetail, setCategoryDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = user.canAddProjectCategoriesFromMultiple || user.isMdp;

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const res = await getData('getCategories');
      if (res) {
        setCatList(Array.isArray(res) ? res : res.data || []);
      }
      setLoading(false);
    };

    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setCategoryName('');
    setCategoryDetail('');
    setIsAddOpen(true);
  };

  const handleOpenView = (cat: any) => {
    setSelectedCategory(cat);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setSelectedCategory(cat);
    setCategoryName(cat.category || '');
    setCategoryDetail(typeof cat.detail === 'string' ? cat.detail : JSON.stringify(cat.detail || ''));
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.append('category', categoryName);
    fd.append('detail', categoryDetail);

    const res = await postData('addCategory', fd, 'Category was added successfully!');
    setSubmitting(false);

    if (res) {
      setIsAddOpen(false);
      setCatList(Array.isArray(res) ? res : res.data || [...catList, { id: Date.now(), category: categoryName, detail: categoryDetail }]);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !categoryName.trim()) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.append('category', categoryName);
    fd.append('detail', categoryDetail);

    const res = await postData(`editCategory/${selectedCategory.id}`, fd, 'Category was updated successfully!');
    setSubmitting(false);

    if (res) {
      setIsEditOpen(false);
      setCatList(Array.isArray(res) ? res : res.data || catList.map(c => c.id === selectedCategory.id ? { ...c, category: categoryName, detail: categoryDetail } : c));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    const res = await deleteData(`deleteCategory/${selectedCategory.id}`, null, 'Category removed successfully!');
    setSubmitting(false);

    if (res) {
      setIsDeleteOpen(false);
      setCatList(Array.isArray(res) ? res : res.data || catList.filter(c => c.id !== selectedCategory.id));
    }
  };

  return (
    <AppLayout
      pageTitle="Manage Project Categories"
      subtitle="Define official service and administrative project categories used across Leo Multiple District 306."
      actions={
        canManage ? (
          <Button variant="brand" onClick={handleOpenAdd} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        ) : null
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
          </div>
        ) : catList.length === 0 ? (
          <Card className="text-center p-12">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Categories Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              There are currently no active project categories defined for this Multiple District.
            </p>
            {canManage && (
              <Button variant="brand" onClick={handleOpenAdd} className="gap-2">
                <Plus className="w-4 h-4" /> Add First Category
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {catList.map((cat, index) => (
              <motion.div
                key={cat.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-base">{cat.category}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs font-normal text-slate-500">
                            MD 306 Standard
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenView(cat)}
                        className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                        title="View Category Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(cat)}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(cat)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-brand-600">
                <FolderPlus className="w-5 h-5" />
                Add Project Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Category Name *
                </label>
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Environmental Action, Youth Outreach"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Description & Criteria
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={categoryDetail}
                  onChange={(e) => setCategoryDetail(e.target.value)}
                  placeholder="Outline purpose, eligibility, and service requirements..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-brand-600">
                <FileText className="w-5 h-5" />
                Category Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Category Name
                </label>
                <p className="text-lg font-bold text-slate-800">{selectedCategory?.category}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Description / Guidelines
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed max-h-60 overflow-y-auto">
                  {selectedCategory?.detail || 'No description provided for this category.'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="brand" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-brand-600">
                <Edit2 className="w-5 h-5" />
                Edit Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Category Name *
                </label>
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Description & Criteria
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={categoryDetail}
                  onChange={(e) => setCategoryDetail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Category?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Are you sure you want to remove <strong className="text-slate-800">{selectedCategory?.category}</strong>? Existing projects assigned to this category will not be lost.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

