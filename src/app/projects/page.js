import KanbanBoard from '@/components/KanbanBoard';
import FloatingElements from '@/components/FloatingElements';
import AuthGate from '@/components/AuthGate';

export const metadata = {
  title: 'Monolith Workflow',
  description: 'Manage your video editing projects with our premium project board.',
};

export default function ProjectsPage() {
  return (
    <div className="kb-page">
      <FloatingElements />
      <AuthGate>
        <KanbanBoard />
      </AuthGate>
    </div>
  );
}
