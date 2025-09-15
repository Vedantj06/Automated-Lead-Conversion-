import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  ArrowDown, 
  Clock, 
  Mail, 
  Target, 
  Settings,
  Play,
  Pause,
  Edit,
  Copy,
  BarChart3
} from 'lucide-react';

interface SequenceStep {
  id: string;
  type: 'email' | 'wait' | 'condition';
  templateId?: string;
  delay: number;
  delayUnit: 'hours' | 'days' | 'weeks';
  conditions?: {
    type: 'opened' | 'clicked' | 'replied' | 'not_opened';
    value?: string;
  }[];
  branches?: {
    true: SequenceStep[];
    false: SequenceStep[];
  };
}

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'manual' | 'lead_created' | 'form_submitted' | 'tag_added';
    value?: string;
  };
  steps: SequenceStep[];
  active: boolean;
  stats: {
    enrolled: number;
    completed: number;
    avgEngagement: number;
  };
}

interface SequenceBuilderProps {
  sequence?: EmailSequence;
  templates: any[];
  onSave: (sequence: EmailSequence) => void;
  onCancel: () => void;
}

export const SequenceBuilder: React.FC<SequenceBuilderProps> = ({
  sequence,
  templates,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<EmailSequence>(
    sequence || {
      id: Date.now().toString(),
      name: '',
      description: '',
      trigger: { type: 'manual' },
      steps: [
        {
          id: 'step-1',
          type: 'email',
          delay: 0,
          delayUnit: 'hours'
        }
      ],
      active: false,
      stats: { enrolled: 0, completed: 0, avgEngagement: 0 }
    }
  );

  const addStep = (afterStepId?: string) => {
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type: 'email',
      delay: 1,
      delayUnit: 'days'
    };

    if (afterStepId) {
      const stepIndex = formData.steps.findIndex(s => s.id === afterStepId);
      const updatedSteps = [...formData.steps];
      updatedSteps.splice(stepIndex + 1, 0, newStep);
      setFormData({ ...formData, steps: updatedSteps });
    } else {
      setFormData({ ...formData, steps: [...formData.steps, newStep] });
    }
  };

  const updateStep = (stepId: string, updates: Partial<SequenceStep>) => {
    const updatedSteps = formData.steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    setFormData({ ...formData, steps: updatedSteps });
  };

  const removeStep = (stepId: string) => {
    const updatedSteps = formData.steps.filter(step => step.id !== stepId);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sequence-name">Sequence Name</Label>
            <Input
              id="sequence-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Website Development Follow-up"
            />
          </div>
          <div>
            <Label htmlFor="sequence-trigger">Trigger</Label>
            <Select 
              value={formData.trigger.type} 
              onValueChange={(value) => setFormData({ 
                ...formData, 
                trigger: { ...formData.trigger, type: value as any } 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Enrollment</SelectItem>
                <SelectItem value="lead_created">New Lead Created</SelectItem>
                <SelectItem value="form_submitted">Form Submitted</SelectItem>
                <SelectItem value="tag_added">Tag Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="sequence-description">Description</Label>
          <Textarea
            id="sequence-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose and goals of this sequence"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Sequence Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sequence Flow</h3>
          <Button onClick={() => addStep()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div className="space-y-4">
          {formData.steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Number */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                {index < formData.steps.length - 1 && (
                  <div className="w-px h-16 bg-gray-300 mt-2" />
                )}
              </div>

              {/* Step Content */}
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Step Type */}
                    <div className="flex items-center justify-between">
                      <Select
                        value={step.type}
                        onValueChange={(value) => updateStep(step.id, { type: value as any })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Send Email</SelectItem>
                          <SelectItem value="wait">Wait/Delay</SelectItem>
                          <SelectItem value="condition">Condition</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addStep(step.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {formData.steps.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Email Step */}
                    {step.type === 'email' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Email Template</Label>
                          <Select
                            value={step.templateId}
                            onValueChange={(value) => updateStep(step.id, { templateId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose email template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Delay Settings */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label>Delay</Label>
                            <Input
                              type="number"
                              value={step.delay}
                              onChange={(e) => updateStep(step.id, { delay: parseInt(e.target.value) || 0 })}
                              min="0"
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Select
                              value={step.delayUnit}
                              onValueChange={(value) => updateStep(step.id, { delayUnit: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Badge variant="outline" className="text-xs">
                              {step.delay === 0 ? 'Immediate' : 
                               `${step.delay} ${step.delayUnit} later`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wait Step */}
                    {step.type === 'wait' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Wait Duration</Label>
                          <Input
                            type="number"
                            value={step.delay}
                            onChange={(e) => updateStep(step.id, { delay: parseInt(e.target.value) || 1 })}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Select
                            value={step.delayUnit}
                            onValueChange={(value) => updateStep(step.id, { delayUnit: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Condition Step */}
                    {step.type === 'condition' && (
                      <div className="space-y-3">
                        <Label>If lead has...</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Select defaultValue="opened">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="opened">Opened previous email</SelectItem>
                              <SelectItem value="clicked">Clicked link</SelectItem>
                              <SelectItem value="replied">Replied to email</SelectItem>
                              <SelectItem value="not_opened">Not opened email</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-sm text-muted-foreground pt-2">
                            Branching logic will be available in Phase 4
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label>Activate sequence</Label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || formData.steps.length === 0}>
            Save Sequence
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sequence List Component
export const SequenceList: React.FC<{
  sequences: EmailSequence[];
  onEdit: (sequence: EmailSequence) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}> = ({ sequences, onEdit, onDelete, onToggle }) => {
  return (
    <div className="space-y-4">
      {sequences.map((sequence) => (
        <Card key={sequence.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{sequence.name}</h3>
                  <Badge variant={sequence.active ? "default" : "secondary"}>
                    {sequence.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {sequence.steps.length} steps
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sequence.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {sequence.trigger.type.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    {sequence.stats.enrolled} enrolled
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={sequence.active}
                  onCheckedChange={(checked) => onToggle(sequence.id, checked)}
                />
                
                <Button variant="outline" size="sm" onClick={() => onEdit(sequence)}>
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(sequence.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {sequences.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sequences yet</h3>
            <p className="text-muted-foreground">
              Create automated email sequences to nurture leads over time
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};