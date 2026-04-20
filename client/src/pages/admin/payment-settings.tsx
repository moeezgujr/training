import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react";

interface PaymentSettings {
  id: string;
  provider: string;
  isEnabled: boolean;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  accountTitle?: string;
  iban?: string;
  branchCode?: string;
  instructions?: string;
  minAmount: string;
  maxAmount?: string;
  processingFee: string;
  createdAt: string;
  updatedAt: string;
}

const paymentProviders = [
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: Smartphone,
    description: 'Mobile wallet payments via EasyPaisa',
    color: 'bg-green-500'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: Smartphone,
    description: 'Mobile wallet payments via JazzCash',
    color: 'bg-orange-500'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank account transfers',
    color: 'bg-blue-500'
  },
  {
    id: 'stripe',
    name: 'Credit/Debit Cards',
    icon: CreditCard,
    description: 'International card payments via Stripe',
    color: 'bg-purple-500'
  }
];

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState<string>('');

  const { data: paymentSettings = [], isLoading } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin/payment-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setNewProvider('');
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/admin/payment-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Payment settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/payment-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  const handleCreateProvider = (providerId: string) => {
    const provider = paymentProviders.find(p => p.id === providerId);
    if (!provider) return;

    const defaultData = {
      provider: providerId,
      isEnabled: true,
      minAmount: "0",
      processingFee: "0",
      instructions: `Pay via ${provider.name}. After payment, please share the transaction screenshot for verification.`
    };

    createMutation.mutate(defaultData);
  };

  const handleUpdateSettings = (id: string, formData: FormData) => {
    const data = {
      isEnabled: formData.get('isEnabled') === 'on',
      accountNumber: formData.get('accountNumber') || undefined,
      accountName: formData.get('accountName') || undefined,
      bankName: formData.get('bankName') || undefined,
      accountTitle: formData.get('accountTitle') || undefined,
      iban: formData.get('iban') || undefined,
      branchCode: formData.get('branchCode') || undefined,
      instructions: formData.get('instructions') || undefined,
      minAmount: formData.get('minAmount') || "0",
      maxAmount: formData.get('maxAmount') || undefined,
      processingFee: formData.get('processingFee') || "0",
    };

    updateMutation.mutate({ id, data });
  };

  const getProviderInfo = (providerId: string) => {
    return paymentProviders.find(p => p.id === providerId);
  };

  const availableProviders = paymentProviders.filter(
    provider => !paymentSettings.some((setting: PaymentSettings) => setting.provider === provider.id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent">
        <AdminHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <AdminHeader />
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">Payment Settings</h1>
            <p className="text-white/70 drop-shadow-sm">
              Configure payment methods and receiving account details for course purchases.
            </p>
          </div>

        {/* Add New Provider */}
        {availableProviders.length > 0 && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5" />
                Add Payment Method
              </CardTitle>
              <CardDescription className="text-white/60">
                Add a new payment method for students to purchase courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableProviders.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <Card 
                      key={provider.id} 
                      className="cursor-pointer bg-white/10 hover:bg-white/20 border-white/10 transition-all group"
                      onClick={() => handleCreateProvider(provider.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`inline-flex p-3 rounded-full ${provider.color} mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-white">{provider.name}</h3>
                        <p className="text-xs text-white/50 mt-1">
                          {provider.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configured Payment Methods */}
        <div className="space-y-4">
          {paymentSettings.map((setting: PaymentSettings) => {
            const providerInfo = getProviderInfo(setting.provider);
            const Icon = providerInfo?.icon || CreditCard;
            const isEditing = editingId === setting.id;

            return (
              <Card key={setting.id} className="bg-black/40 border-white/10 backdrop-blur-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${providerInfo?.color || 'bg-gray-500'} shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">
                          {providerInfo?.name || setting.provider}
                        </CardTitle>
                        <CardDescription className="text-white/50">
                          {providerInfo?.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={setting.isEnabled ? "bg-white text-black" : "bg-white/10 text-white border-white/20"}>
                        {setting.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setEditingId(isEditing ? null : setting.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-red-400 hover:bg-red-900/40"
                        onClick={() => deleteMutation.mutate(setting.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {isEditing ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdateSettings(setting.id, formData);
                      }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <Switch 
                          name="isEnabled"
                          defaultChecked={setting.isEnabled}
                          className="data-[state=checked]:bg-white"
                        />
                        <Label className="text-white">Enable this payment method</Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(setting.provider === 'easypaisa' || setting.provider === 'jazzcash') && (
                          <>
                            <div>
                              <Label className="text-white">Account Number</Label>
                              <Input 
                                name="accountNumber"
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="03xxxxxxxxx"
                                defaultValue={setting.accountNumber || ''}
                              />
                            </div>
                            <div>
                              <Label className="text-white">Account Name</Label>
                              <Input 
                                name="accountName"
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="Account holder name"
                                defaultValue={setting.accountName || ''}
                              />
                            </div>
                          </>
                        )}

                        {setting.provider === 'bank_transfer' && (
                          <>
                            <div>
                              <Label className="text-white">Bank Name</Label>
                              <Input 
                                name="bankName"
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="e.g., HBL, UBL, MCB"
                                defaultValue={setting.bankName || ''}
                              />
                            </div>
                            <div>
                              <Label className="text-white">Account Title</Label>
                              <Input 
                                name="accountTitle"
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="Account holder name"
                                defaultValue={setting.accountTitle || ''}
                              />
                            </div>
                            <div>
                              <Label className="text-white">IBAN</Label>
                              <Input 
                                name="iban"
                                className="bg-white/10 border-white/20 text-white font-mono"
                                placeholder="PK36SCBL0000001123456702"
                                defaultValue={setting.iban || ''}
                              />
                            </div>
                            <div>
                              <Label className="text-white">Branch Code</Label>
                              <Input 
                                name="branchCode"
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="1234"
                                defaultValue={setting.branchCode || ''}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <Label className="text-white">Minimum Amount (PKR)</Label>
                          <Input 
                            name="minAmount"
                            className="bg-white/10 border-white/20 text-white"
                            type="number"
                            placeholder="0"
                            defaultValue={setting.minAmount}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Maximum Amount (PKR)</Label>
                          <Input 
                            name="maxAmount"
                            className="bg-white/10 border-white/20 text-white"
                            type="number"
                            placeholder="No limit"
                            defaultValue={setting.maxAmount || ''}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Processing Fee (%)</Label>
                          <Input 
                            name="processingFee"
                            className="bg-white/10 border-white/20 text-white"
                            type="number"
                            step="0.01"
                            placeholder="0"
                            defaultValue={setting.processingFee}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Payment Instructions</Label>
                        <Textarea 
                          name="instructions"
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="Instructions for customers on how to make payment..."
                          defaultValue={setting.instructions || ''}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={updateMutation.isPending} className="bg-white text-black hover:bg-gray-200">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3 text-white">
                      {setting.accountNumber && (
                        <div>
                          <span className="text-white/60">Account: </span>
                          <span className="font-medium">{setting.accountNumber}</span>
                          {setting.accountName && <span className="text-white/60"> ({setting.accountName})</span>}
                        </div>
                      )}
                      
                      {setting.iban && (
                        <div>
                          <span className="text-white/60">IBAN: </span>
                          <span className="font-mono bg-white/10 px-2 py-1 rounded">{setting.iban}</span>
                        </div>
                      )}

                      {setting.bankName && (
                        <div>
                          <span className="text-white/60">Bank: </span>
                          <span className="font-medium">{setting.bankName}</span>
                          {setting.branchCode && <span className="text-white/60"> (Branch: {setting.branchCode})</span>}
                        </div>
                      )}

                      <div className="flex gap-6 text-sm text-white/50">
                        <span>Min: PKR {setting.minAmount}</span>
                        {setting.maxAmount && <span>Max: PKR {setting.maxAmount}</span>}
                        {parseFloat(setting.processingFee) > 0 && (
                          <span>Fee: {setting.processingFee}%</span>
                        )}
                      </div>

                      {setting.instructions && (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg shadow-inner">
                          <p className="text-sm text-white/80 leading-relaxed">{setting.instructions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {paymentSettings.length === 0 && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Payment Methods Configured</h3>
              <p className="text-white/50 mb-4">
                Add payment methods to enable students to purchase courses.
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}