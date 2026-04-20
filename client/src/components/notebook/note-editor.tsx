import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  X, 
  Tag, 
  Plus,
  Loader2
} from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface PersonalNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteEditorProps {
  note?: PersonalNote | null;
  onClose: () => void;
}

export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate ?? true);
  const [newTag, setNewTag] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Track changes for auto-save indicator
  useEffect(() => {
    const hasChanges = 
      title !== (note?.title || "") ||
      content !== (note?.content || "") ||
      JSON.stringify(tags) !== JSON.stringify(note?.tags || []) ||
      isPrivate !== (note?.isPrivate ?? true);
    
    setHasUnsavedChanges(hasChanges);
  }, [title, content, tags, isPrivate, note]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !title.trim()) return;

    const timeoutId = setTimeout(() => {
      if (note) {
        updateNoteMutation.mutate();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [title, content, tags, isPrivate, hasUnsavedChanges]);

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async () => {
      const noteData = {
        title: title.trim(),
        content,
        tags,
        isPrivate
      };
      
      return await apiRequest('POST', '/api/personal-notes', noteData);
    },
    onSuccess: () => {
      toast({
        title: "Note created",
        description: "Your note has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-notes'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create note",
        description: error.message || "An error occurred while creating the note.",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      
      const noteData = {
        title: title.trim(),
        content,
        tags,
        isPrivate
      };
      
      return await apiRequest('PUT', `/api/personal-notes/${note.id}`, noteData);
    },
    onSuccess: () => {
      if (!updateNoteMutation.variables) {
        toast({
          title: "Note updated",
          description: "Your note has been successfully updated.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/personal-notes'] });
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update note",
        description: error.message || "An error occurred while updating the note.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    if (note) {
      updateNoteMutation.mutate();
    } else {
      createNoteMutation.mutate();
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isLoading = createNoteMutation.isPending || updateNoteMutation.isPending;

  // Quill toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {note ? "Edit Note" : "Create New Note"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Unsaved changes
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="mt-1"
            />
          </div>

          {/* Content Editor */}
          <div className="flex-1 flex flex-col">
            <Label className="mb-2">Content</Label>
            <div className="flex-1 min-h-0">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                style={{ height: '300px' }}
                placeholder="Start writing your note..."
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-16">
            <Label className="mb-2 block">Tags</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="privacy">Private Note</Label>
              <p className="text-sm text-gray-600">Only you can see this note</p>
            </div>
            <Switch
              id="privacy"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </CardContent>

        {/* Actions */}
        <div className="flex-shrink-0 p-6 pt-0">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}