import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Login from './features/auth/Login.jsx';
import Modal from './components/Modal.jsx';
import Dashboard from './features/goals/Dashboard.jsx';
import Completed from './features/goals/Completed.jsx';
import Journey from './features/journey/Journey.jsx';
import BloomedJourneys from './features/journey/BloomedJourneys.jsx';
import GoalDetail from './features/goals/GoalDetail.jsx';
import GoalForm from './features/goals/GoalForm.jsx';
import ContributionForm from './features/goals/ContributionForm.jsx';
import { useGoals } from './hooks/useGoals.js';
import { useGoalRoute } from './hooks/useGoalRoute.js';
import { useAuth } from './hooks/useAuth.js';

export default function App() {
  const auth = useAuth();
  const data = useGoals();
  const route = useGoalRoute();
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const selected = data.goals.find((goal) => goal.id === route.goalId);
  useEffect(() => { setDialog(null); }, [route.goalId]);

  // Every hook above runs on both sides of this gate, so the order stays stable.
  if (!auth.user) return <Login onSignIn={auth.signIn} />;

  const close = () => { setDialog(null); setError(''); };
  const safely = (action) => { try { action(); setError(''); } catch (err) { setError(err.message); } };
  const afterSave = (message) => { setNotice(message); close(); };
  
  const confirmAction = () => safely(() => {
    if (dialog.type === 'delete') 
      { data.remove(selected.id); 
        route.goHome(); 
        afterSave('Goal deleted.'); 
      }
    if (dialog.type === 'reset') 
      { data.reset(); 
        route.goHome(); 
        afterSave('Saved data reset.'); }

  });

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => 
      { event.preventDefault(); 
      document.getElementById('main-content')?.focus(); }}>Skip to content</a>

    <Sidebar view={route.view} onHome={route.goHome} onJourney={route.goJourney}
      onBloomed={route.goBloomed} onCompleted={route.goCompleted}
      user={auth.user} onSignOut={auth.signOut} onExport={() =>
      safely(data.exportCsv)} />
    <div className="main-shell">
      <main id="main-content" tabIndex={-1}>

      {notice && <div role="status" className="notice">{notice}
        <button className="icon-button"
         aria-label="Dismiss message" onClick={() => 
         setNotice('')}><X size={16} /></button></div>}

      {(error || data.loadError) && <div role="alert" className="error-banner">
        <AlertCircle size={18} />
        <span>{error || data.loadError}</span>{data.loadError && <button className="text-button" onClick={() => 
          setDialog({ type: 'reset' })}>Reset saved data</button>}

          {error && <button className="icon-button" aria-label="Dismiss error" onClick={() => 
            setError('')}><X size={16} /></button>}</div>}

      {route.view === 'journey' ? <Journey goals={data.goals}
        onOpen={route.openGoal}
        onBloomed={route.goBloomed}
        onCreate={() => setDialog({ type: 'create' })} /> :

        route.view === 'bloomed' ? <BloomedJourneys goals={data.goals}
        onOpen={route.openGoal}
        onJourney={route.goJourney} /> :

        route.view === 'completed' ? <Completed goals={data.goals}
        onOpen={route.openGoal}
        onHome={route.goHome} /> :

        selected ? <GoalDetail key={selected.id}
      goal={selected} 
      
      onBack={route.goHome}
       onEdit={() => 
        setDialog({ type: 'edit' })} 
        onDelete={() => 
          setDialog({ type: 'delete' })} 
          onContribute={() => setDialog({ type: 'contribute' })} /> :

        route.goalId && !data.loadError ? <section className="empty-intro">
          <h1>Goal not found</h1><p>This goal may have been deleted.</p>
          <button className="button secondary" onClick={route.goHome}>Back to all goals</button></section> :

        <Dashboard goals={data.goals} onCreate={() => 
        setDialog({ type: 'create' })} 
        onOpen={route.openGoal}
        onDemo={() => safely(() => { data.seed();
        setNotice('Sample goals added. You can change their photos or create your own.'); })} />}

    </main></div>
    {(dialog?.type === 'create' || dialog?.type === 'edit') && 
    <GoalForm goal={dialog.type === 'edit' ? selected : null} 
    onClose={close} onSave={(input) => {

      if (dialog.type === 'edit') 
        data.update(selected.id, input);
      else data.create(input);
      afterSave(dialog.type === 'edit' ?
         'Goal updated.' : 'Goal created.');
    }} />}

    {dialog?.type === 'contribute' && selected && 
    <ContributionForm goal={selected} onClose={close} onSave={(input) => {
      
      data.contribute(selected.id, input); afterSave('Contribution saved.');
    }} />}

    {['delete', 'reset'].includes(dialog?.type) && 
    <Modal title={dialog.type === 'delete' ? 'Delete this goal?' : 'Reset saved data?'} onClose={close}>

      <p className="confirm-copy">
        {dialog.type === 'delete' ? 'This removes the goal, its photo, and its contribution history from this browser. This cannot be undone.' : 
        'This clears every goal saved in this browser. Export a CSV first if you want a record of them.'}</p>
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-footer"><button className="button secondary" onClick={close}>Cancel</button>
      <button className="button danger" onClick={confirmAction}>{dialog.type === 'delete' ? 'Delete goal' :
       'Reset data'}</button></div>
       
    </Modal>}
  </div>;
}
