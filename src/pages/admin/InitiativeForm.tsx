import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useInitiative, useCreateInitiative, useUpdateInitiative } from '@/hooks/useInitiatives';
import { useInitiativePartners, useCreateInitiativePartner, useUpdateInitiativePartner, useDeleteInitiativePartner } from '@/hooks/useInitiativePartners';
import { useSyncInitiativePartnerProducts } from '@/hooks/useInitiativePartnerProducts';
import { usePartners, useUpdatePartner } from '@/hooks/usePartners';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Plus, Trash2, Building2, DollarSign, FileCode, Video, Package, Image, Link2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initiativeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  overview: z.string().optional(),
});

type InitiativeFormValues = z.infer<typeof initiativeSchema>;

const partnerDetailsSchema = z.object({
  partner_id: z.string().min(1, 'Partner is required'),
  partner_logo_url: z.string().optional(),
  product_ids: z.array(z.string()).optional(),
  integration_cost: z.string().optional(),
  annual_cost: z.string().optional(),
  pricing_per_call: z.string().optional(),
  pricing_unit: z.string().optional(),
  currency: z.string().optional(),
  billing_contact: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  api_version: z.string().optional(),
  api_documentation: z.string().optional(),
  video_source_type: z.enum(['link', 'upload']).optional(),
  video_title: z.string().optional(),
  video_url: z.string().optional(),
  video_description: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerDetailsSchema>;

const InitiativeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [showAddPartner, setShowAddPartner] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [videoSourceType, setVideoSourceType] = useState<'link' | 'upload'>('link');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: initiative, isLoading: isLoadingInitiative } = useInitiative(id!);
  const { data: initiativePartners, isLoading: isLoadingPartners } = useInitiativePartners(id!);
  const { data: partners } = usePartners();
  const updatePartner = useUpdatePartner();
  const { data: products } = useProducts();
  
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();
  const createInitiativePartner = useCreateInitiativePartner();
  const updateInitiativePartner = useUpdateInitiativePartner();
  const deleteInitiativePartner = useDeleteInitiativePartner();
  const syncProducts = useSyncInitiativePartnerProducts();

  const form = useForm<InitiativeFormValues>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      name: '',
      description: '',
      overview: '',
    },
  });

  const partnerForm = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerDetailsSchema),
    defaultValues: {
      partner_id: '',
      partner_logo_url: '',
      product_ids: [],
      integration_cost: '',
      annual_cost: '',
      pricing_per_call: '',
      pricing_unit: 'Per Call',
      currency: 'INR',
      billing_contact: '',
      terms_and_conditions: '',
      api_version: '1.0',
      api_documentation: '',
      video_source_type: 'link',
      video_title: '',
      video_url: '',
      video_description: '',
    },
  });

  useEffect(() => {
    if (initiative) {
      form.reset({
        name: initiative.name,
        description: initiative.description || '',
        overview: initiative.overview || '',
      });
    }
  }, [initiative, form]);

  const onSubmit = async (data: InitiativeFormValues) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        overview: data.overview || null,
        status: 'active',
        category: null,
        logo_url: null,
      };
      
      if (isEditing) {
        await updateInitiative.mutateAsync({ id, ...payload });
        toast({ title: 'Initiative updated successfully' });
      } else {
        const result = await createInitiative.mutateAsync(payload);
        toast({ title: 'Initiative created successfully' });
        navigate(`/admin/initiatives/${result.id}`);
        return;
      }
      navigate('/admin/initiatives');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `Failed to ${isEditing ? 'update' : 'create'} initiative`,
        description: 'Please try again.',
      });
    }
  };

  const resetPartnerForm = () => {
    partnerForm.reset({
      partner_id: '',
      partner_logo_url: '',
      product_ids: [],
      integration_cost: '',
      annual_cost: '',
      pricing_per_call: '',
      pricing_unit: 'Per Call',
      currency: 'INR',
      billing_contact: '',
      terms_and_conditions: '',
      api_version: '1.0',
      api_documentation: '',
      video_source_type: 'link',
      video_title: '',
      video_url: '',
      video_description: '',
    });
    setSelectedProducts([]);
    setVideoSourceType('link');
    setVideoFile(null);
  };

  const openAddPartner = () => {
    resetPartnerForm();
    setEditingPartnerId(null);
    setShowAddPartner(true);
  };

  const openEditPartner = (initiativePartner: any) => {
    const sourceType = initiativePartner.video_url ? 'link' : 'link';
    partnerForm.reset({
      partner_id: initiativePartner.partner_id,
      partner_logo_url: initiativePartner.partner?.logo_url || '',
      product_ids: initiativePartner.initiative_partner_products?.map((p: any) => p.product_id) || [],
      integration_cost: initiativePartner.integration_cost?.toString() || '',
      annual_cost: initiativePartner.annual_cost?.toString() || '',
      pricing_per_call: initiativePartner.pricing_per_call?.toString() || '',
      pricing_unit: initiativePartner.pricing_unit || 'Per Call',
      currency: initiativePartner.currency || 'INR',
      billing_contact: initiativePartner.billing_contact || '',
      terms_and_conditions: initiativePartner.terms_and_conditions || '',
      api_version: initiativePartner.api_version || '1.0',
      api_documentation: initiativePartner.api_documentation || '',
      video_source_type: sourceType,
      video_title: initiativePartner.video_title || '',
      video_url: initiativePartner.video_url || '',
      video_description: initiativePartner.video_description || '',
    });
    setSelectedProducts(initiativePartner.initiative_partner_products?.map((p: any) => p.product_id) || []);
    setVideoSourceType(sourceType);
    setEditingPartnerId(initiativePartner.id);
    setShowAddPartner(true);
  };

  // Video file validation helper
  const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
    // Check file extension
    const validExtensions = ['mp4', 'webm', 'mov'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      return { valid: false, error: 'Invalid file extension. Allowed: mp4, webm, mov' };
    }
    
    // Check MIME type
    const validMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validMimeTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only video files are allowed.' };
    }
    
    // Additional size check (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 100MB.' };
    }
    
    return { valid: true };
  };

  // Sanitize file extension for upload
  const sanitizeExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const allowedExts = ['mp4', 'webm', 'mov'];
    return allowedExts.includes(ext || '') ? ext! : 'mp4';
  };

  const onPartnerSubmit = async (data: PartnerFormValues) => {
    if (!id) return;

    try {
      // Update partner logo if provided
      if (data.partner_logo_url && data.partner_id) {
        await updatePartner.mutateAsync({
          id: data.partner_id,
          logo_url: data.partner_logo_url,
        });
      }

      // Handle video file upload if a file was selected
      let videoUrl = data.video_url || null;
      if (videoSourceType === 'upload' && videoFile) {
        // Validate the video file before upload
        const validation = validateVideoFile(videoFile);
        if (!validation.valid) {
          toast({
            variant: 'destructive',
            title: 'Invalid video file',
            description: validation.error,
          });
          return;
        }

        setIsUploadingVideo(true);
        try {
          // Use sanitized extension and random UUID for filename to prevent enumeration
          const fileExt = sanitizeExtension(videoFile.name);
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `videos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('partner-videos')
            .upload(filePath, videoFile, {
              cacheControl: '3600',
              upsert: false, // Prevent overwriting existing files
            });

          if (uploadError) throw uploadError;

          // Store the file path (not public URL) since bucket is now private
          // The frontend will use signed URLs to access the video
          videoUrl = filePath;
        } finally {
          setIsUploadingVideo(false);
        }
      }

      const payload = {
        initiative_id: id,
        partner_id: data.partner_id,
        integration_cost: data.integration_cost ? parseFloat(data.integration_cost) : null,
        annual_cost: data.annual_cost ? parseFloat(data.annual_cost) : null,
        pricing_per_call: data.pricing_per_call ? parseFloat(data.pricing_per_call) : null,
        pricing_unit: data.pricing_unit || null,
        currency: data.currency || null,
        billing_contact: data.billing_contact || null,
        terms_and_conditions: data.terms_and_conditions || null,
        api_version: data.api_version || null,
        api_documentation: data.api_documentation || null,
        video_title: data.video_title || null,
        video_url: videoUrl,
        video_description: data.video_description || null,
      };

      let initiativePartnerId = editingPartnerId;

      if (editingPartnerId) {
        await updateInitiativePartner.mutateAsync({ id: editingPartnerId, ...payload });
      } else {
        const result = await createInitiativePartner.mutateAsync(payload);
        initiativePartnerId = result.id;
      }

      // Sync product associations
      if (initiativePartnerId && selectedProducts.length >= 0) {
        await syncProducts.mutateAsync({
          initiativePartnerId,
          productIds: selectedProducts,
        });
      }
      
      toast({ title: editingPartnerId ? 'Partner updated successfully' : 'Partner added successfully' });
      setShowAddPartner(false);
      resetPartnerForm();
      setVideoFile(null);
    } catch (error) {
      console.error('Partner submit error:', error);
      toast({
        variant: 'destructive',
        title: `Failed to ${editingPartnerId ? 'update' : 'add'} partner`,
        description: 'Please try again.',
      });
    }
  };

  const handleDeletePartner = async (initiativePartnerId: string) => {
    if (!id) return;
    try {
      await deleteInitiativePartner.mutateAsync({ id: initiativePartnerId, initiativeId: id });
      toast({ title: 'Partner removed successfully' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove partner',
        description: 'Please try again.',
      });
    }
  };

  if (isEditing && isLoadingInitiative) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/initiatives">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Initiative' : 'Create Initiative'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update initiative details and manage partners' : 'Add a new digital initiative'}
          </p>
        </div>
      </div>

      {/* Initiative Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Initiative Details</CardTitle>
          <CardDescription>Basic information about the initiative</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VKYC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the initiative..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overview</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed overview of the initiative..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed information about the initiative's purpose and scope
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createInitiative.isPending || updateInitiative.isPending}
                >
                  {(createInitiative.isPending || updateInitiative.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Update Initiative' : 'Create Initiative'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin/initiatives">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Partners Section - Only show when editing */}
      {isEditing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Partner Details
              </CardTitle>
              <CardDescription>
                Manage partners and their integration details for this initiative
              </CardDescription>
            </div>
            <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
              <DialogTrigger asChild>
                <Button onClick={openAddPartner} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPartnerId ? 'Edit Partner Details' : 'Add Partner'}</DialogTitle>
                  <DialogDescription>
                    Configure partner details including commercial, technical, and video information
                  </DialogDescription>
                </DialogHeader>

                <Form {...partnerForm}>
                  <form onSubmit={partnerForm.handleSubmit(onPartnerSubmit)} className="space-y-6">
                    {/* Partner Selection */}
                    <FormField
                      control={partnerForm.control}
                      name="partner_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Partner *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!!editingPartnerId}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a partner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partners?.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Partner Logo URL */}
                    <FormField
                      control={partnerForm.control}
                      name="partner_logo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Partner Logo URL
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/partner-logo.png" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL to the partner's logo image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Products Multi-Select */}
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products (Select applicable products)
                      </FormLabel>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                        {products?.map((product) => (
                          <Badge
                            key={product.id}
                            variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/80"
                            onClick={() => {
                              setSelectedProducts(prev => 
                                prev.includes(product.id)
                                  ? prev.filter(p => p !== product.id)
                                  : [...prev, product.id]
                              );
                            }}
                          >
                            {product.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to select products where this partner integration is live
                      </p>
                    </div>

                    <Separator />

                    {/* Commercial Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Commercial Details
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={partnerForm.control}
                          name="integration_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Integration Cost (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 50000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="annual_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Cost (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 100000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="pricing_per_call"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Per Call (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 2.50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="pricing_unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pricing Unit</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Per Call">Per Call</SelectItem>
                                  <SelectItem value="Per Transaction">Per Transaction</SelectItem>
                                  <SelectItem value="Per Month">Per Month</SelectItem>
                                  <SelectItem value="Per User">Per User</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="billing_contact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Contact</FormLabel>
                              <FormControl>
                                <Input placeholder="billing@partner.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={partnerForm.control}
                        name="terms_and_conditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Terms & Conditions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter terms and conditions..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Technical Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        Technical Details
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={partnerForm.control}
                          name="api_version"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Version</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="api_documentation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Documentation URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://docs.partner.com/api" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Video Tutorial */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Tutorial
                      </h4>
                      
                      {/* Video Source Type Toggle */}
                      <div className="space-y-2">
                        <FormLabel>Video Source</FormLabel>
                        <RadioGroup
                          value={videoSourceType}
                          onValueChange={(value: 'link' | 'upload') => setVideoSourceType(value)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="link" id="video-link" />
                            <label htmlFor="video-link" className="flex items-center gap-1 cursor-pointer text-sm">
                              <Link2 className="h-4 w-4" />
                              Video Link (URL)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upload" id="video-upload" />
                            <label htmlFor="video-upload" className="flex items-center gap-1 cursor-pointer text-sm">
                              <Upload className="h-4 w-4" />
                              Upload Video
                            </label>
                          </div>
                        </RadioGroup>
                      </div>

                      <FormField
                        control={partnerForm.control}
                        name="video_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Integration Guide" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {videoSourceType === 'link' ? (
                        <FormField
                          control={partnerForm.control}
                          name="video_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                              </FormControl>
                              <FormDescription>
                                Paste a link to YouTube, Vimeo, or any video hosting platform
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoFile(file);
                              }
                            }}
                          />
                          <div 
                            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                            {videoFile ? (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-primary">{videoFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Click to browse or drag and drop your video file here
                                </p>
                                <Button type="button" variant="outline" size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}>
                                  Choose File
                                </Button>
                              </>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Supports MP4, WebM, MOV (max 100MB)
                            </p>
                          </div>
                          {videoFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                setVideoFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                            >
                              Remove file
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Video will be uploaded when you click Update/Add Partner.
                          </p>
                        </div>
                      )}

                      <FormField
                        control={partnerForm.control}
                        name="video_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of the video..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddPartner(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createInitiativePartner.isPending || updateInitiativePartner.isPending || isUploadingVideo}
                      >
                        {(createInitiativePartner.isPending || updateInitiativePartner.isPending || isUploadingVideo) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isUploadingVideo ? 'Uploading Video...' : editingPartnerId ? 'Update Partner' : 'Add Partner'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoadingPartners ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : initiativePartners && initiativePartners.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {initiativePartners.map((ip: any) => (
                  <AccordionItem key={ip.id} value={ip.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{ip.partner?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {ip.integration_cost && `Integration: ₹${ip.integration_cost.toLocaleString()}`}
                              {ip.integration_cost && ip.annual_cost && ' • '}
                              {ip.annual_cost && `Annual: ₹${ip.annual_cost.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-13 space-y-4 pt-2">
                        <div className="grid gap-4 md:grid-cols-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price Per Call</p>
                            <p className="font-medium">
                              {ip.pricing_per_call ? `₹${ip.pricing_per_call}` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">API Version</p>
                            <p className="font-medium">{ip.api_version || '-'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Billing Contact</p>
                            <p className="font-medium">{ip.billing_contact || '-'}</p>
                          </div>
                        </div>
                        
                        {ip.api_documentation && (
                          <div>
                            <p className="text-muted-foreground text-sm">API Documentation</p>
                            <a href={ip.api_documentation} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                              {ip.api_documentation}
                            </a>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => openEditPartner(ip)}>
                            Edit Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeletePartner(ip.id)}
                            disabled={deleteInitiativePartner.isPending}
                          >
                            {deleteInitiativePartner.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No partners added yet</p>
                <p className="text-sm">Click "Add Partner" to configure partner integrations</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InitiativeForm;
