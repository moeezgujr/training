import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  Video, 
  Music, 
  Image, 
  Globe, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  UserCheck,
  Shield,
  Clock,
  Tag,
  User
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const contentTypes = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'youtube', label: 'YouTube', icon: Video },
  { value: 'vimeo', label: 'Vimeo', icon: Video },
  { value: 'external_link', label: 'External Link', icon: Globe },
];

const protectionLevels = [
  { value: 'basic', label: 'Basic Protection', description: 'Standard download protection' },
  { value: 'enhanced', label: 'Enhanced Protection', description: 'Advanced security measures' },
  { value: 'premium', label: 'Premium Protection', description: 'Maximum security with watermarking' },
];

export default function ContentLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [accessDialog, setAccessDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: '',
    fileUrl: '',
    url: '',
    file: null as File | null,
    tags: '',
    category: '',
    author: '',
    protectionLevel: 'enhanced'
  });

  // Fetch content library data
  const { data: contentLibrary = [], isLoading } = useQuery({
    queryKey: ['/api/admin/content-library'],
    queryFn: async () => {
      const response = await fetch('/api/admin/content-library');
      if (!response.ok) throw new Error('Failed to fetch content library');
      return response.json();
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/admin/content-library', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to upload content');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content uploaded successfully",
        description: "The content has been added to the library.",
      });
      setUploadDialog(false);
      setUploadData({
        title: '',
        description: '',
        type: '',
        fileUrl: '',
        url: '',
        file: null,
        tags: '',
        category: '',
        author: '',
        protectionLevel: 'enhanced'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-library'] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload content. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/content-library/${selectedContent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "Content has been successfully updated.",
      });
      setEditDialog(false);
      setSelectedContent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-library'] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/content-library/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete content');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content deleted",
        description: "Content has been successfully deleted.",
      });
      setDeleteDialog(false);
      setSelectedContent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-library'] });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleUpload = () => {
    if (!uploadData.title || (!uploadData.file && !uploadData.url)) return;

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('type', uploadData.type);
    formData.append('tags', uploadData.tags);
    formData.append('category', uploadData.category);
    formData.append('author', uploadData.author);
    formData.append('protectionLevel', uploadData.protectionLevel);

    if (uploadData.file) {
      formData.append('file', uploadData.file);
    } else if (uploadData.url) {
      formData.append('url', uploadData.url);
    }

    uploadMutation.mutate(formData);
  };

  const filteredContent = contentLibrary.filter((item: any) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    const typeData = contentTypes.find(t => t.value === type);
    return typeData ? typeData.icon : FileText;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading content library...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600 mt-1">Manage your learning content and resources</p>
          </div>
          <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Content</DialogTitle>
                <DialogDescription>
                  Add new learning content to your library
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="content-title">Title</Label>
                  <Input
                    id="content-title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={uploadData.type} onValueChange={(value) => setUploadData({ ...uploadData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(uploadData.type === 'youtube' || uploadData.type === 'vimeo' || uploadData.type === 'external_link') ? (
                  <div>
                    <Label htmlFor="content-url">URL</Label>
                    <Input
                      id="content-url"
                      value={uploadData.url}
                      onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                      placeholder="Enter URL"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="content-file">File Upload</Label>
                    <Input
                      id="content-file"
                      type="file"
                      onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                      accept={uploadData.type === 'video' ? 'video/*' : 
                             uploadData.type === 'audio' ? 'audio/*' :
                             uploadData.type === 'pdf' ? '.pdf' :
                             uploadData.type === 'image' ? 'image/*' : '*'}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="content-description">Description</Label>
                  <Textarea
                    id="content-description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Enter content description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content-category">Category</Label>
                    <Input
                      id="content-category"
                      value={uploadData.category}
                      onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                      placeholder="e.g., Programming, Design"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content-author">Author</Label>
                    <Input
                      id="content-author"
                      value={uploadData.author}
                      onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })}
                      placeholder="Content author"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content-tags">Tags</Label>
                  <Input
                    id="content-tags"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div>
                  <Label htmlFor="protection-level">Protection Level</Label>
                  <Select value={uploadData.protectionLevel} onValueChange={(value) => setUploadData({ ...uploadData, protectionLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select protection level" />
                    </SelectTrigger>
                    <SelectContent>
                      {protectionLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-gray-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUploadDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!uploadData.title || (!uploadData.file && !uploadData.url) || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Content'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content: any) => {
            const TypeIcon = getTypeIcon(content.type);
            return (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                      <Badge variant="secondary">{content.type}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedContent(content);
                          setEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedContent(content);
                          setDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {content.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.category && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="h-4 w-4" />
                        {content.category}
                      </div>
                    )}
                    {content.author && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        {content.author}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      {protectionLevels.find(p => p.value === content.protectionLevel)?.label || 'Basic Protection'}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContent(content);
                          setAccessDialog(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Access
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading your first piece of content'}
            </p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Content</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedContent?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedContent && deleteMutation.mutate(selectedContent.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Access Management Dialog */}
        <Dialog open={accessDialog} onOpenChange={setAccessDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Access</DialogTitle>
              <DialogDescription>
                Control who can access "{selectedContent?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Access management features will be available soon.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setAccessDialog(false)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Grant Access
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}