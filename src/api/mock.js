// MOCK RESPONSES. Used while VITE_USE_MOCK is not "false". Delete once the FastAPI backend is live.
import { papers, gaps } from '../data/mock';

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const analyzeText = (ps) => ({
  domain: ['Computer Vision', 'Video Understanding', 'Intelligent Transportation Systems'],
  understanding: `You are asking: "${ps.trim()}" In short, the problem is about recognizing accident events automatically in continuous video, where footage quality, lighting and camera angle vary widely.`,
  objectives: ['Detect accident events in real-world CCTV video with high recall.', 'Stay reliable under low resolution and poor lighting.', 'Generalize across cameras, cities and datasets.'],
  questions: ['How much does video quality affect detection accuracy?', 'Which spatiotemporal model gives the best accuracy and speed trade-off?', 'Does a model trained on one dataset transfer to another?'],
  datasets: ['Car Crash Dataset (CCD)', 'DoTA', 'DAD', 'Nexar Dashcam'],
  methodology: 'Extract frame features with a CNN or video transformer, model motion over time with LSTM or temporal attention, then classify accident vs. normal clips. Compare against CNN and CNN + LSTM baselines.',
  challenges: ['Accidents are rare, so classes are imbalanced.', 'Night-time and low-resolution footage degrade features.', 'Real-time inference limits model size.'],
  contributions: ['A robustness evaluation under degraded footage.', 'A day/night and cross-dataset benchmark protocol.', 'A reproducible baseline comparison.']
});

export const mock = {
  async login(email) { await wait(400); const n = email.split('@')[0].replace(/[._-]+/g, ' '); return { token: 'mock-token', user: { name: n.replace(/\b\w/g, c => c.toUpperCase()), email } }; },
  async signup(name, email) { await wait(400); return { token: 'mock-token', user: { name, email } }; },
  async analyze(ps) { await wait(2600); return { ...analyzeText(ps), papers }; },
  async detectGaps() { await wait(2200); return gaps; },
  async plan(selected) { await wait(1200); return Object.fromEntries(selected.map(g => [g.title, g.plan])); },
  async novelty() { await wait(1500); return { score: 72,
    novel: ['Evaluation focused on low-resolution CCTV rather than curated footage.', 'A combined day/night and cross-dataset test protocol.', 'Degradation-aware training compared against standard baselines.'],
    readiness: [['Clear problem statement', true], ['Defined datasets and baselines', true], ['Evaluation metrics chosen', true], ['Results to support claims', false], ['Difference from closest paper stated', false]], overlap: papers }; },
  async draft({ fields: v, sections }) { await wait(1800);
    const g = k => (v[k] || '').trim();
  const refLines = g('refs').split('\n').map(x => x.trim()).filter(Boolean);
      const write = (s) => ({
      'Abstract': `${g('title')}\n\n${g('problem')} ${g('gap') ? 'Existing work leaves a gap: ' + g('gap') + ' ' : ''}${g('method') ? 'We address it using ' + g('method') + '. ' : ''}${g('results') ? 'Results show: ' + g('results') : '[Add your main result.]'}`,
      'Introduction': `${g('problem')}\n\n${g('gap') ? 'Despite progress, ' + g('gap') : '[Explain what is missing in current work.]'}\n\nThe main contributions of this paper are: (1) [contribution], (2) [contribution], (3) [contribution].`,
      'Literature Review': `[Theme 1: summarise 3 to 4 related papers and what they left open.]\n\n[Theme 2: ...]\n\n${g('gap') ? 'Taken together, these studies show that ' + g('gap') : ''}${refLines.length ? '\n\nPapers to discuss: ' + refLines.map((_, i) => `[${i + 1}]`).join(' ') : ''}`,
      'Methodology': `${g('method') || '[Describe your approach.]'}${g('data') ? '\n\nData: ' + g('data') + '.' : ''}\n\n[Add architecture, preprocessing and training details.]`,
      'Experimental Setup': `Datasets: ${g('data') || '[add]'}.\nMetrics: ${g('metrics') || '[add]'}.\n\n[Add splits, baselines, hardware and hyperparameters.]`,
      'Results': `${g('results') || '[Insert your results table and figures.]'}\n\n[Discuss these results against each baseline${g('metrics') ? ' using ' + g('metrics') : ''}.]`,
      'Conclusion': `${g('gap') ? 'This paper addressed the following gap: ' + g('gap') + '\n\n' : ''}${g('results') ? 'Our findings: ' + g('results') + '\n\n' : ''}Limitations: [add]. Future work: [add].`,
      'References': refLines.length ? refLines.map((r, i) => `[${i + 1}] ${r}`).join('\n') : '[Paste your references in the form to list them here.]'
    }[s] || `[Write your ${s} section here.]\n\nContext: ${g('problem')}`);

    return Object.fromEntries(sections.map(s => [s, write(s)]));
  }
};
