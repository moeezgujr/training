import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Save, Plus, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from "@/components/empty-state";
import type { Note } from "@/lib/types";

interface NoteTakingProps {
  contentId: string;
  timestamp?: number; // For video or audio content (in seconds)
}

export function NoteTaking({ contentId, timestamp }: NoteTakingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editText, setEditText] = useState("");

  // Fetch notes for this content
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['/api/notes', contentId],
    queryFn: () => apiRequest<Note[]>(`/api/notes?contentId=${contentId}`),
    enabled: isAuthenticated && !!contentId,
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (data: { contentId: string; text: string; timestamp?: number }) => 
      apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes', contentId] });
      setIsAdding(false);
      setNoteText("");
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { text: string; timestamp?: number } }) => 
      apiRequest(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes', contentId] });
      setIsEditing(null);
      setEditText("");
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/notes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes', contentId] });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = () => {
    if (!noteText.trim()) return;
    
    createMutation.mutate({
      contentId,
      text: noteText,
      timestamp: timestamp || undefined,
    });
  };

  const handleUpdateNote = (id: string) => {
    if (!editText.trim()) return;
    
    updateMutation.mutate({
      id,
      data: {
        text: editText,
        timestamp: timestamp || undefined,
      },
    });
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate(id);
    }
  };

  const startEditing = (note: Note) => {
    setIsEditing(note.id);
    setEditText(note.text);
  };

  const formatTimestamp = (seconds?: number | null) => {
    if (!seconds) return null;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <EmptyState
            icon={<Pencil className="w-10 h-10 text-muted-foreground" />}
            title="Sign in to take notes"
            description="Notes help you remember important information from your course materials."
            actionHref="/api/login"
            actionText="Sign in"
            size="sm"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex justify-between items-center">
          <div>My Notes</div>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="flex gap-1 items-center"
            >
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAdding && (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-6">
              <Textarea
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {timestamp && (
                  <>
                    <Clock className="h-3 w-3" /> 
                    <span>At {formatTimestamp(timestamp)}</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNoteText("");
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={!noteText.trim() || createMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading notes...</div>
        ) : notes.length === 0 && !isAdding ? (
          <div className="py-8 text-center text-muted-foreground">
            <EmptyState
              icon={<Pencil className="w-8 h-8 text-muted-foreground" />}
              title="No notes yet"
              description="Take notes to keep track of important information."
              actionText="Add Note"
              actionOnClick={() => setIsAdding(true)}
              size="sm"
            />
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className={isEditing === note.id ? "border-primary" : ""}>
                  <CardContent className="pt-6">
                    {isEditing === note.id ? (
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{note.text}</div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {note.timestamp && (
                        <span className="mr-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTimestamp(note.timestamp)}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {isEditing === note.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditing(null);
                              setEditText("");
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateNote(note.id)}
                            disabled={!editText.trim() || updateMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(note)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}