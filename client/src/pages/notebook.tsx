import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar,
  Tag,
  BookOpen,
  FileText
} from "lucide-react";
import { NoteEditor } from "@/components/notebook/note-editor";
import { DeleteNoteDialog } from "@/components/notebook/delete-note-dialog";
import { formatDistanceToNow } from "date-fns";

interface PersonalNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotebookPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<PersonalNote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Fetch all notes
  const { data: notes = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/personal-notes'],
    queryFn: () => apiRequest('GET', '/api/personal-notes').then(res => res.json())
  });

  // Search notes
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/personal-notes/search', searchQuery],
    queryFn: () => 
      searchQuery.trim() 
        ? apiRequest('GET', `/api/personal-notes/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json())
        : Promise.resolve([]),
    enabled: searchQuery.trim().length > 0
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => apiRequest('DELETE', `/api/personal-notes/${noteId}`),
    onSuccess: () => {
      toast({
        title: "Note deleted",
        description: "Your note has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personal-notes'] });
      setDeleteNoteId(null);
      if (selectedNote?.id === deleteNoteId) {
        setSelectedNote(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete note",
        description: error.message || "An error occurred while deleting the note.",
        variant: "destructive",
      });
    },
  });

  const displayNotes = searchQuery.trim() ? searchResults || [] : notes;

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: PersonalNote) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setDeleteNoteId(noteId);
  };

  const confirmDelete = () => {
    if (deleteNoteId) {
      deleteNoteMutation.mutate(deleteNoteId);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Notebook</h1>
              <p className="text-gray-600">Organize your thoughts and learning notes</p>
            </div>
          </div>
          <Button onClick={handleCreateNote} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{notes.length}</p>
                  <p className="text-sm text-gray-600">Total Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Tag className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {[...new Set(notes.flatMap((note: PersonalNote) => note.tags))].length}
                  </p>
                  <p className="text-sm text-gray-600">Unique Tags</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {notes.filter((note: PersonalNote) => {
                      const noteDate = new Date(note.createdAt);
                      const today = new Date();
                      return noteDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600">Today's Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        {displayNotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery.trim() ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery.trim() 
                  ? "Try adjusting your search terms or browse all notes"
                  : "Start by creating your first note to capture your thoughts and ideas"
                }
              </p>
              {!searchQuery.trim() && (
                <Button onClick={handleCreateNote} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create Your First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isSearching ? [] : displayNotes).map((note: PersonalNote) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {note.title}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent 
                  className="pt-0"
                  onClick={() => handleEditNote(note)}
                >
                  <div 
                    className="text-sm text-gray-600 line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{ 
                      __html: note.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                    }}
                  />
                  
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading state for search */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <NoteEditor
          note={selectedNote}
          onClose={handleEditorClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteNoteId && (
        <DeleteNoteDialog
          isOpen={!!deleteNoteId}
          onClose={() => setDeleteNoteId(null)}
          onConfirm={confirmDelete}
          isLoading={deleteNoteMutation.isPending}
        />
      )}
    </div>
  );
}