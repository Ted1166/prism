import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { type UserCredentials, getUserCredentials, saveUserCredentials, getDefaultCredentials } from '@/lib/storage';
import { Save, Plus, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CredentialsEditor() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<UserCredentials>(
    getUserCredentials() || getDefaultCredentials()
  );
  const [newSkillName, setNewSkillName] = useState('');

  useEffect(() => {
    // Load credentials on mount
    const saved = getUserCredentials();
    if (saved) {
      setCredentials(saved);
    }
  }, []);

  const handleSave = () => {
    saveUserCredentials(credentials);
    toast({
      title: "✓ Credentials Saved",
      description: "Your credentials have been updated successfully.",
    });
  };

  const addSkill = () => {
    if (newSkillName.trim()) {
      setCredentials({
        ...credentials,
        skills: [...credentials.skills, { name: newSkillName, level: 5 }],
      });
      setNewSkillName('');
    }
  };

  const removeSkill = (index: number) => {
    setCredentials({
      ...credentials,
      skills: credentials.skills.filter((_, i) => i !== index),
    });
  };

  const updateSkillLevel = (index: number, level: number) => {
    const updatedSkills = [...credentials.skills];
    updatedSkills[index].level = level;
    setCredentials({ ...credentials, skills: updatedSkills });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>Your Credentials</CardTitle>
            <CardDescription>
              Edit your information (kept private, used for ZK proofs)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={credentials.name}
            onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
            placeholder="Your name"
          />
        </div>

        {/* Current Employer */}
        <div className="space-y-2">
          <Label htmlFor="employer">Current Employer</Label>
          <Input
            id="employer"
            value={credentials.employer}
            onChange={(e) => setCredentials({ ...credentials, employer: e.target.value })}
            placeholder="Company name"
          />
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience: {credentials.yearsExperience}</Label>
          <Slider
            id="experience"
            min={0}
            max={30}
            step={1}
            value={[credentials.yearsExperience]}
            onValueChange={(value) => setCredentials({ ...credentials, yearsExperience: value[0] })}
            className="w-full"
          />
        </div>

        {/* Education */}
        <div className="space-y-2">
          <Label htmlFor="education">Education Level</Label>
          <Select
            value={credentials.education}
            onValueChange={(value) => setCredentials({ ...credentials, education: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
              <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Master's Degree">Master's Degree</SelectItem>
              <SelectItem value="Doctorate">Doctorate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <Label>Skills & Proficiency</Label>
          
          {/* Existing Skills */}
          <div className="space-y-3">
            {credentials.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-3">
                <Badge variant="outline" className="min-w-[120px]">
                  {skill.name}
                </Badge>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[skill.level]}
                  onValueChange={(value) => updateSkillLevel(index, value[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{skill.level}/10</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Skill */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new skill"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button variant="outline" onClick={addSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          <Label htmlFor="projects">Number of Projects: {credentials.projects}</Label>
          <Slider
            id="projects"
            min={0}
            max={50}
            step={1}
            value={[credentials.projects]}
            onValueChange={(value) => setCredentials({ ...credentials, projects: value[0] })}
            className="w-full"
          />
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" />
          Save Credentials
        </Button>

        {/* Privacy Note */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            🔒 <strong>Privacy Note:</strong> This information stays on your device and is only used to generate zero-knowledge proofs. Your identity is never revealed to employers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}