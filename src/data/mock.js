export const featureList = [
  { id: 'explore', label: 'Explore' },
  { id: 'novelty', label: 'Novelty check' },
  { id: 'gaps', label: 'Research gaps' },
  { id: 'experiment', label: 'Experiment plan' },
  { id: 'writer', label: 'Draft paper' }
];

export const papers = [
  { title: 'Deep learning for automatic traffic accident detection', citations: 312, publisher: 'IEEE Access', year: 2024, date: '18 Apr 2024', similarity: 87, type: 'Conference', source: 'IEEE Xplore' },
  { title: 'Vision-based crash recognition in surveillance video', citations: 198, publisher: 'Pattern Recognition', year: 2023, date: '07 Sep 2023', similarity: 82, type: 'Journal', source: 'ScienceDirect' },
  { title: 'Spatiotemporal networks for road event detection', citations: 141, publisher: 'Expert Systems with Applications', year: 2024, date: '12 Jan 2024', similarity: 76, type: 'Journal', source: 'Elsevier' },
  { title: 'Real-time accident recognition using video transformers', citations: 57, publisher: 'Applied AI', year: 2025, date: '03 Feb 2025', similarity: 68, type: 'Conference', source: 'ACM Digital Library' }
];

export const gaps = [
  {
    title: 'Limited performance in low-resolution CCTV footage', evidence: 'Supported by 7 papers', tone: 'green', impact: 'High',
    done: 'Detects accidents with a CNN + LSTM pipeline and reports strong accuracy on curated, higher-quality footage.',
    limit: 'Accuracy drops sharply as resolution falls and compression artifacts increase; real CCTV is rarely clean.',
    improve: 'Evaluate robust video models on degraded footage and measure how performance falls with resolution.',
    source: 'IEEE Access · 2024 · Limitations', quotes: ['Performance decreases as image resolution and compression artifacts increase.', 'Future evaluations should include more realistic surveillance conditions.'],
    plan: { objective: 'Measure and reduce the accuracy drop of accident detection on low-resolution CCTV video.', methodology: 'Downsample and compress clips at 3 quality levels, fine-tune a video transformer with degradation-aware augmentation, compare with the unmodified baseline.', datasets: ['Car Crash Dataset (CCD)', 'DoTA'], baselines: ['CNN + LSTM', 'Video Transformer'], metrics: ['F1-score', 'Recall', 'AUC'], contribution: 'A resolution-robustness benchmark and a degradation-aware training recipe.' }
  },
  {
    title: 'Weak coverage of night-time accident scenarios', evidence: 'Supported by 5 papers', tone: 'amber', impact: 'High',
    done: 'Reports strong daytime detection results across several public benchmarks.',
    limit: 'Low-light and night scenes are underrepresented, so night-time reliability is unknown.',
    improve: 'Build a balanced day/night evaluation split and measure robustness under low-light conditions.',
    source: 'Pattern Recognition · 2023 · Future Work', quotes: ['Night-time scenarios remain underrepresented in current benchmarks.', 'Future datasets should include diverse lighting conditions.'],
    plan: { objective: 'Quantify and improve accident detection under low-light and night conditions.', methodology: 'Create a day/night split, apply low-light enhancement as preprocessing, and train with lighting augmentation. Report day and night results separately.', datasets: ['DAD', 'Nexar Dashcam'], baselines: ['CNN baseline', 'CNN + LSTM'], metrics: ['Precision', 'Recall', 'F1-score'], contribution: 'A day/night evaluation protocol with per-condition results.' }
  },
  {
    title: 'Limited cross-dataset generalization', evidence: 'Supported by 6 papers', tone: 'grey', impact: 'Medium',
    done: 'Validates the model mainly on the same benchmark used during development.',
    limit: 'Results may reflect dataset-specific bias, so performance on unseen cameras and cities is unclear.',
    improve: 'Test the baseline and the proposed model on an independent dataset without retraining.',
    source: 'Expert Systems with Applications · 2024 · Discussion', quotes: ['Cross-dataset validation is necessary to assess generalization.', 'Independent benchmarks can expose dataset-specific bias.'],
    plan: { objective: 'Test whether accident detectors trained on one dataset hold up on another.', methodology: 'Train on one dataset, test zero-shot on the others, then try light domain adaptation and report the gap.', datasets: ['Car Crash Dataset (CCD)', 'DoTA', 'DAD'], baselines: ['CNN + LSTM', 'Video Transformer'], metrics: ['Accuracy', 'F1-score', 'AUC'], contribution: 'A cross-dataset generalization study with a reproducible protocol.' }
  }
];

export const mentors = [
  { name: 'Dr. Priya Sharma', role: 'ML Research', initials: 'PS', expertise: ['Computer Vision', 'Deep Learning', 'Research Design'], rating: '4.9', price: '₹799/session' },
  { name: 'Dr. Arjun Mehta', role: 'AI & NLP Research', initials: 'AM', expertise: ['NLP', 'RAG', 'Paper Writing'], rating: '4.8', price: '₹699/session' },
  { name: 'Dr. Neha Verma', role: 'Data Science Research', initials: 'NV', expertise: ['ML', 'Statistics', 'Experiments'], rating: '4.9', price: '₹599/session' }
];
