import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/SEO';
import { SITE_URL } from '../../data/marketingPages';
import { FREE_TEST } from '../../data/freePracticeTest';
import { PageHero, Section, FaqList, buildPageJsonLd } from '../marketing/shared';
import './library.css';

const PATH = '/csp-practice-exam/free-test';
export const TEST_FAQS = [
  { q: 'Is this the official CSP exam?', a: 'No. It is an independent practice test. CSP® is a registered mark of BCSP. SafeTrack Pro Global is not affiliated with or endorsed by BCSP, and no credential or CEUs are awarded.' },
  { q: 'Do I need an account?', a: 'Not for these 10 questions. The full 100-question practice exam is free with an account (one per day). The certificate of completion needs a paid plan.' },
];

export default function PracticeTestPage() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState({});
  const done = i >= FREE_TEST.length;
  const score = FREE_TEST.reduce((n, q, k) => n + (picked[k] === q.a ? 1 : 0), 0);
  const weak = [...new Set(FREE_TEST.filter((q, k) => picked[k] !== q.a).map((q) => q.domain))];
  const q = FREE_TEST[i];
  const answered = picked[i] !== undefined;
  const title = 'Free CSP Practice Test - 10 Questions with Answers | SafeTrack Pro';
  const description = 'Take a free 10-question CSP-style safety practice test with instant answers and explanations. No sign-up. Then try the full 100-question practice exam.';
  const crumbs = [{ name: 'Home', to: '/' }, { name: 'CSP practice exam', to: '/csp-practice-exam' }, { name: 'Free test', to: PATH }];
  return (
    <main className="mk-page">
      <Seo title={title} description={description} canonical={`${SITE_URL}${PATH}`} jsonLd={buildPageJsonLd({ name: title, description, path: PATH, breadcrumbs: crumbs, faqs: TEST_FAQS })} />
      <PageHero breadcrumbs={crumbs} eyebrow="Free practice test" h1="Free CSP practice test: 10 questions" lead="Answer, see the explanation straight away, and find out which topics to study. Practice only - not the official exam."
        primary={{ label: 'Full 100-question exam', to: '/signup' }} secondary={{ label: 'Free safety documents', to: '/free-safety-documents' }} />
      <Section>
        {!done ? (
          <div className="lib-q" data-testid="test-q">
            <p><span className="lib-tag">Question {i + 1} of {FREE_TEST.length}</span><span className="lib-tag">{q.domain}</span></p>
            <h2 style={{ fontSize: 19, lineHeight: 1.4 }}>{q.q}</h2>
            {q.o.map((o, k) => (
              <button key={o} type="button" disabled={answered} onClick={() => setPicked({ ...picked, [i]: k })}
                className={`lib-opt ${answered && k === q.a ? 'right' : ''} ${answered && picked[i] === k && k !== q.a ? 'wrong' : ''}`}>{String.fromCharCode(65 + k)}. {o}</button>
            ))}
            {answered && <div className="lib-msg" role="status"><b>{picked[i] === q.a ? 'Correct.' : `The answer is ${String.fromCharCode(65 + q.a)}.`}</b> {q.e}</div>}
            {answered && <p style={{ marginTop: 14 }}><button type="button" className="lib-btn" onClick={() => setI(i + 1)}>{i + 1 === FREE_TEST.length ? 'See my result' : 'Next question'}</button></p>}
          </div>
        ) : (
          <div className="lib-q" data-testid="test-result">
            <h2>You scored {score} out of {FREE_TEST.length}</h2>
            <p>{score >= 8 ? 'Strong result. The full exam will show whether you can hold it for four hours.' : 'A good start. The full exam shows your score for every domain.'}</p>
            {weak.length > 0 && <p><b>Study next:</b> {weak.join(', ')}</p>}
            <p><Link className="lib-btn" to="/signup">Create a free account for the full 100 questions</Link></p>
            <p>Already registered? <Link to="/exam">Open the full practice exam</Link></p>
            <p style={{ fontSize: 13, color: '#4a5568' }}>The full exam and your result are free. A certificate of completion is included in paid plans. It is not a professional certification and awards no CEUs.</p>
            <p><button type="button" className="lib-btn ghost" onClick={() => { setPicked({}); setI(0); }}>Try again</button></p>
          </div>
        )}
      </Section>
      <FaqList faqs={TEST_FAQS} />
    </main>
  );
}
