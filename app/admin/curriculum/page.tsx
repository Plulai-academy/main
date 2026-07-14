'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, GhostButton, PrimaryButton, EmptyState } from '@/components/school-admin/ui';
import { Modal, FormField } from '@/components/school-admin/Modal';
import {
  getAllTracks, upsertTrack, deleteTrack,
  getSkillNodesByTrack, upsertSkillNode, deleteSkillNode,
  getLessonsBySkillNode, upsertLesson, deleteLesson,
} from '@/lib/admin/queries';
import type { AdminTrack, AdminSkillNode, AdminLesson } from '@/types/admin';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0 0 8px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.inkMuted};
  margin-bottom: 20px;

  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.reef};
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    padding: 0;
  }
`;

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const emptyTrack = (): AdminTrack => ({
  id: '', name: '', emoji: '', description: '', color: '#17D9C0', sortOrder: 0, isActive: true,
});
const emptyNode = (trackId: string): AdminSkillNode => ({
  id: '', trackId, title: '', emoji: '', description: '', xpReward: 50, sortOrder: 0,
  requiredNodes: [], ageGroups: ['mini', 'junior', 'pro', 'expert'], isActive: true,
});
const emptyLesson = (skillNodeId: string): AdminLesson => ({
  id: '', skillNodeId, title: '', emoji: '', description: '', lessonType: 'lesson',
  xpReward: 10, durationMins: 10, sortOrder: 0, ageGroups: ['mini', 'junior', 'pro', 'expert'],
  contentJson: '{\n  "sections": []\n}', isActive: true,
});

export default function AdminCurriculumPage() {
  const [tracks, setTracks] = useState<AdminTrack[] | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<AdminTrack | null>(null);
  const [nodes, setNodes] = useState<AdminSkillNode[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<AdminSkillNode | null>(null);
  const [lessons, setLessons] = useState<AdminLesson[] | null>(null);

  const [trackModal, setTrackModal] = useState<{ mode: 'create' | 'edit'; track: AdminTrack } | null>(null);
  const [nodeModal, setNodeModal] = useState<{ mode: 'create' | 'edit'; node: AdminSkillNode } | null>(null);
  const [lessonModal, setLessonModal] = useState<{ mode: 'create' | 'edit'; lesson: AdminLesson } | null>(null);

  const refreshTracks = () => getAllTracks().then(setTracks).catch(console.error);
  const refreshNodes = (trackId: string) => getSkillNodesByTrack(trackId).then(setNodes).catch(console.error);
  const refreshLessons = (nodeId: string) => getLessonsBySkillNode(nodeId).then(setLessons).catch(console.error);

useEffect(() => {
  refreshTracks();
}, []); 
  function openTrack(t: AdminTrack) {
    setSelectedTrack(t);
    setSelectedNode(null);
    setLessons(null);
    refreshNodes(t.id);
  }

  function openNode(n: AdminSkillNode) {
    setSelectedNode(n);
    refreshLessons(n.id);
  }

  async function handleDeleteTrack(t: AdminTrack) {
    if (!confirm(`Delete track "${t.name}"? This cascades to its skill nodes and lessons.`)) return;
    await deleteTrack(t.id);
    refreshTracks();
  }
  async function handleDeleteNode(n: AdminSkillNode) {
    if (!confirm(`Delete skill "${n.title}"? This cascades to its lessons.`)) return;
    await deleteSkillNode(n.id);
    if (selectedTrack) refreshNodes(selectedTrack.id);
  }
  async function handleDeleteLesson(l: AdminLesson) {
    if (!confirm(`Delete lesson "${l.title}"?`)) return;
    await deleteLesson(l.id);
    if (selectedNode) refreshLessons(selectedNode.id);
  }

  // ── Lesson-level view ──
  if (selectedNode) {
    return (
      <>
        <Title>{selectedNode.title}</Title>
        <Breadcrumb>
          <button onClick={() => { setSelectedTrack(null); setSelectedNode(null); }}>Tracks</button>
          <span>/</span>
          <button onClick={() => setSelectedNode(null)}>{selectedTrack?.name}</button>
          <span>/</span>
          <span>{selectedNode.title}</span>
        </Breadcrumb>
        <TopActions>
          <PrimaryButton onClick={() => setLessonModal({ mode: 'create', lesson: emptyLesson(selectedNode.id) })}>
            Add lesson
          </PrimaryButton>
        </TopActions>
        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Lessons</Eyebrow>
              <PanelTitle>{lessons ? `${lessons.length} lesson${lessons.length === 1 ? '' : 's'}` : 'Loading…'}</PanelTitle>
            </div>
          </PanelHeader>
          <div style={{ paddingTop: 12 }}>
            {lessons && lessons.length === 0 ? (
              <EmptyState><strong>No lessons yet</strong>Add the first lesson for this skill.</EmptyState>
            ) : (
              <TableScroll>
                <Table>
                  <thead><tr><th>Lesson</th><th>Type</th><th>XP</th><th>Duration</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {(lessons ?? []).map((l) => (
                      <tr key={l.id}>
                        <td>{l.emoji} {l.title}</td>
                        <td>{l.lessonType}</td>
                        <td>{l.xpReward}</td>
                        <td>{l.durationMins}m</td>
                        <td><Badge $tone={l.isActive ? 'reef' : 'neutral'}>{l.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <GhostButton onClick={() => setLessonModal({ mode: 'edit', lesson: l })}>Edit</GhostButton>{' '}
                          <GhostButton onClick={() => handleDeleteLesson(l)}>Delete</GhostButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </div>
        </Panel>

        {lessonModal && (
          <LessonFormModal
            mode={lessonModal.mode}
            lesson={lessonModal.lesson}
            onClose={() => setLessonModal(null)}
            onSaved={() => { setLessonModal(null); refreshLessons(selectedNode.id); }}
          />
        )}
      </>
    );
  }

  // ── Skill node-level view ──
  if (selectedTrack) {
    return (
      <>
        <Title>{selectedTrack.name}</Title>
        <Breadcrumb>
          <button onClick={() => setSelectedTrack(null)}>Tracks</button>
          <span>/</span>
          <span>{selectedTrack.name}</span>
        </Breadcrumb>
        <TopActions>
          <PrimaryButton onClick={() => setNodeModal({ mode: 'create', node: emptyNode(selectedTrack.id) })}>
            Add skill
          </PrimaryButton>
        </TopActions>
        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Skill nodes</Eyebrow>
              <PanelTitle>{nodes ? `${nodes.length} skill${nodes.length === 1 ? '' : 's'}` : 'Loading…'}</PanelTitle>
            </div>
          </PanelHeader>
          <div style={{ paddingTop: 12 }}>
            {nodes && nodes.length === 0 ? (
              <EmptyState><strong>No skills yet</strong>Add the first skill for this track.</EmptyState>
            ) : (
              <TableScroll>
                <Table>
                  <thead><tr><th>Skill</th><th>XP</th><th>Age groups</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {(nodes ?? []).map((n) => (
                      <tr key={n.id}>
                        <td>
                          <button onClick={() => openNode(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}>
                            {n.emoji} {n.title}
                          </button>
                        </td>
                        <td>{n.xpReward}</td>
                        <td>{n.ageGroups.join(', ')}</td>
                        <td><Badge $tone={n.isActive ? 'reef' : 'neutral'}>{n.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <GhostButton onClick={() => openNode(n)}>Lessons</GhostButton>{' '}
                          <GhostButton onClick={() => setNodeModal({ mode: 'edit', node: n })}>Edit</GhostButton>{' '}
                          <GhostButton onClick={() => handleDeleteNode(n)}>Delete</GhostButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </div>
        </Panel>

        {nodeModal && (
          <SkillNodeFormModal
            mode={nodeModal.mode}
            node={nodeModal.node}
            onClose={() => setNodeModal(null)}
            onSaved={() => { setNodeModal(null); refreshNodes(selectedTrack.id); }}
          />
        )}
      </>
    );
  }

  // ── Track-level view ──
  return (
    <>
      <Title>Curriculum</Title>
      <TopActions>
        <PrimaryButton onClick={() => setTrackModal({ mode: 'create', track: emptyTrack() })}>
          Add track
        </PrimaryButton>
      </TopActions>
      <Panel>
        <PanelHeader>
          <div>
            <Eyebrow>Tracks</Eyebrow>
            <PanelTitle>{tracks ? `${tracks.length} track${tracks.length === 1 ? '' : 's'}` : 'Loading…'}</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {tracks && tracks.length === 0 ? (
            <EmptyState><strong>No tracks yet</strong>Create your first track.</EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead><tr><th>Track</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {(tracks ?? []).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <button onClick={() => openTrack(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}>
                          {t.emoji} {t.name}
                        </button>
                      </td>
                      <td><Badge $tone={t.isActive ? 'reef' : 'neutral'}>{t.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <GhostButton onClick={() => openTrack(t)}>Skills</GhostButton>{' '}
                        <GhostButton onClick={() => setTrackModal({ mode: 'edit', track: t })}>Edit</GhostButton>{' '}
                        <GhostButton onClick={() => handleDeleteTrack(t)}>Delete</GhostButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </div>
      </Panel>

      {trackModal && (
        <TrackFormModal
          mode={trackModal.mode}
          track={trackModal.track}
          onClose={() => setTrackModal(null)}
          onSaved={() => { setTrackModal(null); refreshTracks(); }}
        />
      )}
    </>
  );
}

// ── Modals ──

function TrackFormModal({ mode, track, onClose, onSaved }: { mode: 'create' | 'edit'; track: AdminTrack; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(track);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await upsertTrack(form, mode === 'create');
      onSaved();
    } catch {
      setError('Could not save. Check the ID is unique and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={mode === 'create' ? 'Add track' : 'Edit track'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {mode === 'create' && (
          <FormField>
            ID (lowercase, hyphens only)
            <input required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. robotics" />
          </FormField>
        )}
        <FormField>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
        <FormField>Emoji<input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></FormField>
        <FormField>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <FormField>Color (hex)<input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></FormField>
        <FormField>Sort order<input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></FormField>
        <FormField>
          Status
          <select value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </FormField>
        {error && <p style={{ color: '#FF6B57', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function SkillNodeFormModal({ mode, node, onClose, onSaved }: { mode: 'create' | 'edit'; node: AdminSkillNode; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(node);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const AGE_GROUPS = ['mini', 'junior', 'pro', 'expert'];

  function toggleAgeGroup(g: string) {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.includes(g) ? f.ageGroups.filter((x) => x !== g) : [...f.ageGroups, g],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await upsertSkillNode(form, mode === 'create');
      onSaved();
    } catch {
      setError('Could not save. Check the ID is unique and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={mode === 'create' ? 'Add skill' : 'Edit skill'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {mode === 'create' && (
          <FormField>ID<input required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. robotics-basics" /></FormField>
        )}
        <FormField>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField>Emoji<input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></FormField>
        <FormField>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <FormField>XP reward<input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} /></FormField>
        <FormField>Sort order<input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></FormField>
        <FormField>
          Age groups
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {AGE_GROUPS.map((g) => (
              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 400 }}>
                <input type="checkbox" checked={form.ageGroups.includes(g)} onChange={() => toggleAgeGroup(g)} /> {g}
              </label>
            ))}
          </div>
        </FormField>
        <FormField>
          Status
          <select value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </FormField>
        {error && <p style={{ color: '#FF6B57', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function LessonFormModal({ mode, lesson, onClose, onSaved }: { mode: 'create' | 'edit'; lesson: AdminLesson; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(lesson);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const AGE_GROUPS = ['mini', 'junior', 'pro', 'expert'];

  function toggleAgeGroup(g: string) {
    setForm((f) => ({
      ...f,
      ageGroups: f.ageGroups.includes(g) ? f.ageGroups.filter((x) => x !== g) : [...f.ageGroups, g],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await upsertLesson(form, mode === 'create');
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    onSaved();
  }

  return (
    <Modal title={mode === 'create' ? 'Add lesson' : 'Edit lesson'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {mode === 'create' && (
          <FormField>ID<input required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. robotics-basics-l1" /></FormField>
        )}
        <FormField>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField>Emoji<input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></FormField>
        <FormField>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <FormField>
          Lesson type
            <select value={form.lessonType} onChange={(e) => setForm({ ...form, lessonType: e.target.value })}>
                <option value="video">video</option>
                <option value="reading">reading</option>
                <option value="interactive">interactive</option>
                <option value="quiz">quiz</option>
                <option value="project">project</option>
                <option value="code_editor">code_editor</option>
            </select>
        </FormField>
        <FormField>XP reward<input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} /></FormField>
        <FormField>Duration (mins)<input type="number" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })} /></FormField>
        <FormField>Sort order<input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></FormField>
        <FormField>
          Age groups
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {AGE_GROUPS.map((g) => (
              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 400 }}>
                <input type="checkbox" checked={form.ageGroups.includes(g)} onChange={() => toggleAgeGroup(g)} /> {g}
              </label>
            ))}
          </div>
        </FormField>
        <FormField>
          Content JSON
          <textarea
            value={form.contentJson}
            onChange={(e) => setForm({ ...form, contentJson: e.target.value })}
            rows={12}
            style={{ fontFamily: 'monospace', fontSize: 12, padding: 10, borderRadius: 8, resize: 'vertical' }}
          />
        </FormField>
        <FormField>
          Status
          <select value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </FormField>
        {error && <p style={{ color: '#FF6B57', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}