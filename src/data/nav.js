import { LayoutDashboard, Search, Lightbulb, FlaskConical, Target, FileText, Users } from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explore', label: 'Explore', icon: Search },
  { id: 'novelty', label: 'Novelty check', icon: Target },
  { id: 'gaps', label: 'Research gaps', icon: Lightbulb },
  { id: 'experiment', label: 'Experiment plan', icon: FlaskConical },
  { id: 'writer', label: 'Draft paper', icon: FileText },
  { id: 'mentors', label: 'My mentors', icon: Users }
];
