import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Settings, 
  FileText,
  Trophy,
  Calendar,
  Users
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Contest, Question, InsertQuestion, InsertContest } from '@shared/schema';

export default function CMS() {
  const [, setLocation] = useLocation();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showContestDialog, setShowContestDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      setLocation('/cms-login');
      return;
    }
    
    // Verify token validity
    fetch('/api/cms/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      if (!response.ok) {
        localStorage.removeItem('cms_token');
        setLocation('/cms-login');
      }
    });
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('cms_token');
    setLocation('/cms-login');
  };

  // Fetch contests with auth
  const { data: contests, isLoading: contestsLoading } = useQuery({
    queryKey: ['/api/cms/contests'],
    queryFn: async () => {
      const token = localStorage.getItem('cms_token');
      const response = await fetch('/api/cms/contests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch contests');
      return response.json();
    },
    refetchInterval: 5000 // Refetch every 5 seconds for real-time updates
  });

  // Fetch questions with auth and real-time updates
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/cms/questions'],
    queryFn: async () => {
      const token = localStorage.getItem('cms_token');
      const response = await fetch('/api/cms/questions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    refetchInterval: 2000 // Refetch every 2 seconds for real-time updates
  });

  // Create/Update Question Mutation
  const questionMutation = useMutation({
    mutationFn: async (data: { question: InsertQuestion; isEdit: boolean; id?: number }) => {
      const token = localStorage.getItem('cms_token');
      const url = data.isEdit ? `/api/cms/questions/${data.id}` : '/api/cms/questions';
      const method = data.isEdit ? 'PUT' : 'POST';
      return apiRequest(url, { 
        method, 
        body: JSON.stringify(data.question),
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/questions'] });
      setShowQuestionDialog(false);
      setEditingQuestion(null);
      toast({ title: 'Question saved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to save question', variant: 'destructive' });
    }
  });

  // Delete Question Mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('cms_token');
      return apiRequest(`/api/cms/questions/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/questions'] });
      toast({ title: 'Question deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete question', variant: 'destructive' });
    }
  });

  // Create/Update Contest Mutation
  const contestMutation = useMutation({
    mutationFn: async (data: { contest: InsertContest; isEdit: boolean; id?: number }) => {
      const token = localStorage.getItem('cms_token');
      const url = data.isEdit ? `/api/cms/contests/${data.id}` : '/api/cms/contests';
      const method = data.isEdit ? 'PUT' : 'POST';
      return apiRequest(url, { 
        method, 
        body: JSON.stringify(data.contest),
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/contests'] });
      setShowContestDialog(false);
      setEditingContest(null);
      toast({ title: 'Contest saved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to save contest', variant: 'destructive' });
    }
  });

  const handleQuestionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const questionData: InsertQuestion = {
      contestId: editingQuestion?.contestId || contests?.[0]?.id || 1,
      questionNumber: parseInt(formData.get('questionNumber') as string),
      category: formData.get('category') as string,
      questionText: formData.get('questionText') as string,
      optionA: formData.get('optionA') as string,
      optionB: formData.get('optionB') as string,
      optionC: formData.get('optionC') as string,
      votesA: parseInt(formData.get('votesA') as string) || 30000,
      votesB: parseInt(formData.get('votesB') as string) || 50000,
      votesC: parseInt(formData.get('votesC') as string) || 70000,
    };

    questionMutation.mutate({
      question: questionData,
      isEdit: !!editingQuestion,
      id: editingQuestion?.id
    });
  };

  const handleContestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contestData: InsertContest = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      prize: formData.get('prize') as string,
      startTime: new Date(formData.get('startTime') as string),
      endTime: new Date(formData.get('endTime') as string),
      isActive: formData.get('isActive') === 'true',
      totalParticipants: parseInt(formData.get('totalParticipants') as string) || 0,
    };

    contestMutation.mutate({
      contest: contestData,
      isEdit: !!editingContest,
      id: editingContest?.id
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Content Management System</h1>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Questions</span>
            </TabsTrigger>
            <TabsTrigger value="contests" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Contests</span>
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
                <p className="text-gray-600">Manage contest questions and their options</p>
              </div>
              <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingQuestion(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuestionSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="questionNumber">Question Number</Label>
                        <Input
                          id="questionNumber"
                          name="questionNumber"
                          type="number"
                          defaultValue={editingQuestion?.questionNumber || ''}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          name="category"
                          defaultValue={editingQuestion?.category || ''}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="questionText">Question Text</Label>
                      <Textarea
                        id="questionText"
                        name="questionText"
                        defaultValue={editingQuestion?.questionText || ''}
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Options</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">A</Badge>
                          <Input
                            name="optionA"
                            placeholder="Option A"
                            defaultValue={editingQuestion?.optionA || ''}
                            required
                          />
                          <Input
                            name="votesA"
                            type="number"
                            placeholder="Votes"
                            defaultValue={editingQuestion?.votesA || 30000}
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">B</Badge>
                          <Input
                            name="optionB"
                            placeholder="Option B"
                            defaultValue={editingQuestion?.optionB || ''}
                            required
                          />
                          <Input
                            name="votesB"
                            type="number"
                            placeholder="Votes"
                            defaultValue={editingQuestion?.votesB || 50000}
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">C</Badge>
                          <Input
                            name="optionC"
                            placeholder="Option C"
                            defaultValue={editingQuestion?.optionC || ''}
                            required
                          />
                          <Input
                            name="votesC"
                            type="number"
                            placeholder="Votes"
                            defaultValue={editingQuestion?.votesC || 70000}
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowQuestionDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={questionMutation.isPending}>
                        {questionMutation.isPending ? 'Saving...' : 'Save Question'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Questions List */}
            <div className="grid gap-4">
              {questionsLoading ? (
                <div className="text-center py-8">Loading questions...</div>
              ) : (
                questions?.map((question: Question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="secondary">Q{question.questionNumber}</Badge>
                            <Badge variant="outline">{question.category}</Badge>
                          </div>
                          <CardTitle className="text-lg">{question.questionText}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingQuestion(question);
                              setShowQuestionDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuestionMutation.mutate(question.id)}
                            disabled={deleteQuestionMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">A</Badge>
                            <span className="text-sm">{question.optionA}</span>
                          </div>
                          <span className="text-xs text-gray-500">{question.votesA?.toLocaleString()} votes</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">B</Badge>
                            <span className="text-sm">{question.optionB}</span>
                          </div>
                          <span className="text-xs text-gray-500">{question.votesB?.toLocaleString()} votes</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">C</Badge>
                            <span className="text-sm">{question.optionC}</span>
                          </div>
                          <span className="text-xs text-gray-500">{question.votesC?.toLocaleString()} votes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Contests Tab */}
          <TabsContent value="contests" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contests</h2>
                <p className="text-gray-600">Manage contest settings and details</p>
              </div>
              <Dialog open={showContestDialog} onOpenChange={setShowContestDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingContest(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contest
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContest ? 'Edit Contest' : 'Add New Contest'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleContestSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Contest Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingContest?.name || ''}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingContest?.description || ''}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prize">Prize</Label>
                      <Input
                        id="prize"
                        name="prize"
                        defaultValue={editingContest?.prize || ''}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="datetime-local"
                          defaultValue={editingContest?.startTime ? new Date(editingContest.startTime).toISOString().slice(0, 16) : ''}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="datetime-local"
                          defaultValue={editingContest?.endTime ? new Date(editingContest.endTime).toISOString().slice(0, 16) : ''}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="isActive">Status</Label>
                        <Select name="isActive" defaultValue={editingContest?.isActive ? 'true' : 'false'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="totalParticipants">Total Participants</Label>
                        <Input
                          id="totalParticipants"
                          name="totalParticipants"
                          type="number"
                          defaultValue={editingContest?.totalParticipants || 0}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowContestDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={contestMutation.isPending}>
                        {contestMutation.isPending ? 'Saving...' : 'Save Contest'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Contests List */}
            <div className="grid gap-4">
              {contestsLoading ? (
                <div className="text-center py-8">Loading contests...</div>
              ) : (
                contests?.map((contest: Contest) => (
                  <Card key={contest.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={contest.isActive ? "default" : "secondary"}>
                              {contest.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Users className="w-4 h-4" />
                              <span>{contest.totalParticipants} participants</span>
                            </div>
                          </div>
                          <CardTitle className="text-xl">{contest.name}</CardTitle>
                          <p className="text-gray-600 mt-1">{contest.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingContest(contest);
                              setShowContestDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{contest.prize}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(contest.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(contest.endTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}