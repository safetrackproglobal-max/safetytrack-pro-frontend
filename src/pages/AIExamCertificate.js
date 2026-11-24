// src/pages/AIExamCertificate.js
// Exam + Certificate + Certificate Verification (extracted from AIDocumentsPage.js)
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Divider,
  Avatar,
  Tabs,
  Statistic,
  Progress,
  Badge,
  Radio,
  Typography,
  Alert,
  List,
  Tag,
  Checkbox,
  message
} from 'antd';
import {
  SafetyCertificateOutlined,
  UserOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  BookOutlined,
  ExperimentOutlined,
  LeftOutlined,
  RightOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  StarOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  VerifiedOutlined,
  QrcodeOutlined,
  ScanOutlined
} from '@ant-design/icons';
import AIService from '../services/GeneralAIService';
import { useAuth } from '../context/AuthContext';
import api, { apiPost } from '../services/api';
import { getCredentialLevel, checkDocumentPermission } from './AIDocumentsUtils';

// Shown wherever the exam or its certificate appears. Keep it in sync with the backend (_EXAM_PRACTICE_DISCLAIMER).
export const PRACTICE_EXAM_NAME = 'Safety Professional Practice Exam';
export const PRACTICE_DISCLAIMER =
  'Practice exam by SafeTrack Pro Global. It is not the official CSP® exam, is not affiliated with or endorsed by BCSP, ' +
  'and passing it does not grant the CSP credential, a licence or CEUs. The certificate is a certificate of completion.';
const backendOrigin = () => String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const { TabPane } = Tabs;
const { Title, Text } = Typography;

/**
 * Props (all come from AIDocumentsPage):
 *  - userPlan
 *  - selectedIndustry
 *  - companyInfo
 *  - documentTypes          (passed in to avoid a circular import)
 *  - setUpgradeInfo
 *  - setShowUpgradeModal
 *
 * Ref API:
 *  - ref.current.startExam()   -> same as handleStartExamFlow (used by the FloatButton)
 */
const AIExamCertificate = forwardRef(function AIExamCertificate(
  {
    userPlan,
    selectedIndustry,
    companyInfo,
    documentTypes,
    setUpgradeInfo,
    setShowUpgradeModal
  },
  ref
) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  // Refs so the exam timer (created once) always calls the LATEST submit logic
  const performSubmitRef = useRef(null);
  const autoSubmitFiredRef = useRef(false);

  // Exam question navigation (was activePdfSection in the page; exam-only copy)
  const [activePdfSection, setActivePdfSection] = useState(0);

  // Enhanced exam flow states
  const [examSessionId, setExamSessionId] = useState('');
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [activeExam, setActiveExam] = useState(null);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [examScore, setExamScore] = useState(null);
  const [selectedExamTopic, setSelectedExamTopic] = useState('safety_basics');
  const [examDifficulty, setExamDifficulty] = useState('intermediate');
  const [examQuestionsCount, setExamQuestionsCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [examFlowStep, setExamFlowStep] = useState('setup');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedCourseForExam, setSelectedCourseForExam] = useState('');
  const [examProgress, setExamProgress] = useState({
    answered: 0,
    total: 0,
    timeRemaining: 0
  });
  const [examTimer, setExamTimer] = useState(null);

  // Certificate state
  const [activeCertificate, setActiveCertificate] = useState({
    data: null,
    source: null,
    timestamp: null,
    examScore: null,
    sessionId: null
  });

  // Admin signature
  const [adminSignature, setAdminSignature] = useState({
    name: 'SafeTrack Pro Global',
    title: 'Platform Owner',
    company: 'SafeTrack Pro Global',
    signature_id: 'ADMIN-PLATFORM-OWNER',
    loading: true
  });

  // ============= CERTIFICATE VERIFICATION STATE VARIABLES =============
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // ============= INITIALIZATION =============
  useEffect(() => {
    fetchAdminSignature();
  }, []);

  const fetchAdminSignature = async () => {
    try {
      const response = await fetch('/api/admin/signature', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminSignature({ ...data.signature, loading: false });
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin signature:', error);
      setAdminSignature(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    return () => {
      if (examTimer) clearInterval(examTimer);
    };
  }, [examTimer]);

  // ============= EXAM FUNCTIONS =============
  const handleStartExamFlow = () => {
    console.log('🎯 Starting exam flow, userPlan:', userPlan);

    if (userPlan === 'super_admin') {
      console.log('👑 SUPER ADMIN: Bypassing all permission checks');
      setUserName('');
      setUserEmail('');
      setSelectedCourseForExam('');
      setUserAnswers({});
      setExamScore(null);
      setExamFlowStep('setup');
      setExamModalVisible(true);
      message.success('👑 Super Admin: opening the practice exam');
      return;
    }

    const permission = checkDocumentPermission('exam', userPlan, documentTypes);

    if (permission.allowed) {
      console.log('✅ Practice exam access granted (100 questions, 4 hours)');
      setUserName('');
      setUserEmail('');
      setSelectedCourseForExam('');
      setUserAnswers({});
      setExamScore(null);
      setExamFlowStep('setup');
      setExamModalVisible(true);
    } else {
      console.log('❌ Exam access denied');
      setUpgradeInfo({
        requiredPlan: 'pro',
        currentPlan: userPlan,
        documentName: PRACTICE_EXAM_NAME,
        features: [
          'Full-length practice exam (100 questions, 4 hours)',
          'Questions follow the published CSP exam outline',
          'Instant scoring with explanations',
          'Certificate of completion (practice)',
          'Unlimited practice attempts'
        ]
      });
      setShowUpgradeModal(true);
    }
  };

  // ============================================================
  // STRONG DEBUG HELPERS
  // ============================================================

  // 1. Debug logger with visual indicators
  const debugExam = (step, data, message = '') => {
    const timestamp = new Date().toISOString();
    console.log(`%c🔍 [EXAM-DEBUG] ${step} ${timestamp}`, 'color: #ff6b00; font-weight: bold; font-size: 14px');
    console.log(`%c📝 ${message}`, 'color: #666; font-size: 12px');
    console.log('%c📊 Data:', 'color: #0066cc; font-weight: bold');
    console.log(JSON.stringify(data, (key, value) => {
      // Truncate long strings for readability
      if (typeof value === 'string' && value.length > 500) {
        return value.substring(0, 500) + '... [TRUNCATED]';
      }
      return value;
    }, 2));
    console.log('%c' + '='.repeat(80), 'color: #666');
  };

  // 2. Response inspector
  const inspectResponse = (response, source) => {
    console.log(`%c🔬 [INSPECT] Response from ${source}`, 'color: #9900cc; font-weight: bold; font-size: 14px');
    console.log('📦 Type:', typeof response);
    console.log('📦 Keys:', Object.keys(response || {}));
    console.log('📦 Is null/undefined:', response === null || response === undefined);

    // Check for session_id in various places
    const sessionIdPaths = [
      { path: 'session_id', value: response?.session_id },
      { path: 'data.session_id', value: response?.data?.session_id },
      { path: 'sessionId', value: response?.sessionId },
      { path: 'data.sessionId', value: response?.data?.sessionId },
      { path: 'session.id', value: response?.session?.id },
      { path: 'data.session.id', value: response?.data?.session?.id },
      { path: 'exam_session_id', value: response?.exam_session_id },
      { path: 'data.exam_session_id', value: response?.data?.exam_session_id },
    ];

    console.log('%c🔑 Session ID Check:', 'color: #ff6b00; font-weight: bold');
    sessionIdPaths.forEach(({ path, value }) => {
      const found = value !== undefined && value !== null;
      console.log(`  ${found ? '✅' : '❌'} ${path}:`, found ? value : 'NOT FOUND');
    });

    // Check for questions in various places
    const questionPaths = [
      { path: 'questions', value: response?.questions?.length },
      { path: 'data.questions', value: response?.data?.questions?.length },
      { path: 'exam_data.questions', value: response?.exam_data?.questions?.length },
      { path: 'data.exam_data.questions', value: response?.data?.exam_data?.questions?.length },
      { path: 'examData.questions', value: response?.examData?.questions?.length },
    ];

    console.log('%c❓ Questions Check:', 'color: #0066cc; font-weight: bold');
    questionPaths.forEach(({ path, value }) => {
      const found = value !== undefined && value !== null && value > 0;
      console.log(`  ${found ? '✅' : '❌'} ${path}:`, found ? `${value} questions` : 'NOT FOUND');
    });

    // Show full response structure
    console.log('%c📄 Full Response Structure:', 'color: #9900cc; font-weight: bold');
    console.log(JSON.stringify(response, null, 2));
    console.log('%c' + '='.repeat(80), 'color: #666');

    return sessionIdPaths.find(p => p.value !== undefined && p.value !== null)?.value || null;
  };

  // 3. Debug state tracker
  const trackExamState = (stateName, stateValue) => {
    console.log(`%c📌 [STATE] ${stateName}`, 'color: #00aa00; font-weight: bold');
    if (typeof stateValue === 'object') {
      console.log(JSON.stringify(stateValue, null, 2));
    } else {
      console.log(stateValue);
    }
  };

  const handleProceedToExam = async () => {
    console.log('%c🚀🚀🚀 EXAM FLOW STARTED 🚀🚀🚀', 'color: #ff6b00; font-weight: bold; font-size: 20px');
    console.log('%c' + '='.repeat(80), 'color: #ff6b00');

    // STEP 0: Check initial state
    debugExam('INITIAL_STATE', {
      userName,
      userEmail,
      userPlan,
      selectedExamTopic,
      selectedCourseForExam,
      selectedIndustry,
      examSessionId: examSessionId || 'NOT SET YET',
      activeExam: activeExam ? 'EXISTS' : 'NULL'
    }, 'Initial component state before exam start');

    if (!userName || userName.trim() === '') {
      console.warn('⚠️ [EXAM] No user name provided');
      debugExam('VALIDATION_FAILED', { userName }, 'User name is empty');
      message.warning('Please enter your name before starting the exam');
      return;
    }

    setLoading(true);
    setExamFlowStep('taking_exam');

    try {
      const userId = getUserId();
      const useDeepSeekExam = (userPlan === 'super_admin' || userPlan === 'pro' || userPlan === 'enterprise');

      debugExam('USER_INFO', {
        userId,
        userName,
        userEmail,
        userPlan,
        useDeepSeekExam,
        isSuperAdmin: userPlan === 'super_admin'
      }, 'User and plan information');

      let examData = null;
      let sessionId = null;
      let questionsList = [];

      // ============================================================
      // STEP 1: GENERATE EXAM
      // ============================================================
      if (useDeepSeekExam && userPlan === 'super_admin') {
        console.log('%c👑 SUPER ADMIN PATH', 'color: #ff6b00; font-weight: bold; font-size: 16px');
        debugExam('DEEPSEEK_START', {
          requestData: {
            topic: selectedExamTopic || 'safety_management',
            difficulty: 'advanced',
            count: 100,
            user_name: userName,
            user_id: userId,
            course: selectedCourseForExam || 'CSP Exam Preparation (practice)',
          }
        }, 'Starting DeepSeek exam generation');

        const requestData = {
          topic: selectedExamTopic || 'safety_management',
          difficulty: 'advanced',
          count: 100,
          domain: 'safety_management',
          include_explanations: true,
          scenario_based: true,
          user_name: userName,
          user_id: userId,
          user_email: userEmail || `${userId}@exam.com`,
          course: selectedCourseForExam || 'CSP Exam Preparation (practice)',
          industry: selectedIndustry,
          is_super_admin: true
        };

        try {
          console.log('📤 [EXAM] Making DeepSeek API call...');
          const deepSeekResult = await apiPost('/deepseek/generate-exam', requestData);

          // INSPECT THE RAW RESPONSE
          const foundSessionId = inspectResponse(deepSeekResult, 'DeepSeek');
          debugExam('DEEPSEEK_RESPONSE', {
            rawResponse: deepSeekResult,
            foundSessionId: foundSessionId,
            hasSuccess: deepSeekResult?.success,
            hasQuestions: deepSeekResult?.questions?.length > 0,
            hasDataQuestions: deepSeekResult?.data?.questions?.length > 0,
            status: deepSeekResult?.status,
            error: deepSeekResult?.error
          }, 'DeepSeek raw response inspection');

          // Check for 403 or error
          if (deepSeekResult && (deepSeekResult.status === 403 || deepSeekResult.error === 'Permission denied')) {
            console.warn('⚠️ [EXAM] DeepSeek 403 error, falling back to backend');
            debugExam('DEEPSEEK_403', deepSeekResult, 'DeepSeek returned 403, using backend fallback');

            const result = await generateExamFromBackend(userId, 100);
            if (!result) {
              console.error('❌ [EXAM] Backend fallback failed');
              debugExam('BACKEND_FALLBACK_FAILED', null, 'Backend fallback returned null');
              setExamFlowStep('setup');
              setLoading(false);
              return;
            }
            examData = result.examData;
            sessionId = result.sessionId;
            questionsList = result.questionsList;

            debugExam('BACKEND_FALLBACK_SUCCESS', {
              sessionId,
              questionsCount: questionsList.length,
              examDataKeys: Object.keys(examData || {})
            }, 'Backend fallback succeeded');

          } else if (deepSeekResult?.success && deepSeekResult?.questions?.length > 0) {
            // Success path
            questionsList = deepSeekResult.questions;
            sessionId = deepSeekResult.session_id || deepSeekResult.data?.session_id || `DEEPSEEK_EXAM_${Date.now()}`;
            examData = {
              exam_id: sessionId,
              exam_type: 'CSP_FULL_EXAM_DEEPSEEK',
              domain: selectedExamTopic || 'safety_management',
              total_questions: questionsList.length,
              passing_score: 75,
              time_limit_minutes: 240,
              generated_at: new Date().toISOString(),
              questions: questionsList,
              source: 'deepseek'
            };
            console.log('✅ [EXAM] DeepSeek exam generated:', questionsList.length, 'questions');
            console.log('📋 [EXAM] Session ID:', sessionId);

            debugExam('DEEPSEEK_SUCCESS', {
              sessionId,
              questionsCount: questionsList.length,
              firstQuestion: questionsList[0]?.question?.substring(0, 50) + '...'
            }, 'DeepSeek exam generation successful');

          } else if (deepSeekResult?.questions?.length > 0) {
            // Response without success flag but has questions
            questionsList = deepSeekResult.questions;
            sessionId = deepSeekResult.session_id || `DEEPSEEK_EXAM_${Date.now()}`;
            examData = {
              exam_id: sessionId,
              exam_type: 'CSP_FULL_EXAM_DEEPSEEK',
              domain: selectedExamTopic || 'safety_management',
              total_questions: questionsList.length,
              passing_score: 75,
              time_limit_minutes: 240,
              generated_at: new Date().toISOString(),
              questions: questionsList,
              source: 'deepseek'
            };
            console.log('✅ [EXAM] DeepSeek exam generated (no success flag):', questionsList.length, 'questions');

            debugExam('DEEPSEEK_SUCCESS_NO_FLAG', {
              sessionId,
              questionsCount: questionsList.length
            }, 'DeepSeek exam successful but no success flag in response');

          } else if (deepSeekResult?.data?.questions?.length > 0) {
            // Nested data path
            questionsList = deepSeekResult.data.questions;
            sessionId = deepSeekResult.data.session_id || deepSeekResult.session_id || `DEEPSEEK_EXAM_${Date.now()}`;
            examData = {
              exam_id: sessionId,
              exam_type: 'CSP_FULL_EXAM_DEEPSEEK',
              domain: selectedExamTopic || 'safety_management',
              total_questions: questionsList.length,
              passing_score: 75,
              time_limit_minutes: 240,
              generated_at: new Date().toISOString(),
              questions: questionsList,
              source: 'deepseek'
            };
            console.log('✅ [EXAM] DeepSeek exam generated (from .data):', questionsList.length, 'questions');

            debugExam('DEEPSEEK_SUCCESS_DATA', {
              sessionId,
              questionsCount: questionsList.length
            }, 'DeepSeek exam successful from nested data');

          } else {
            console.warn('⚠️ [EXAM] DeepSeek response had no questions, trying backend fallback');
            debugExam('DEEPSEEK_NO_QUESTIONS', {
              responseKeys: Object.keys(deepSeekResult || {}),
              hasData: !!deepSeekResult?.data
            }, 'DeepSeek response missing questions array');

            const result = await generateExamFromBackend(userId, 100);
            if (!result) {
              console.error('❌ [EXAM] Backend fallback failed');
              setExamFlowStep('setup');
              setLoading(false);
              return;
            }
            examData = result.examData;
            sessionId = result.sessionId;
            questionsList = result.questionsList;
          }
        } catch (deepSeekError) {
          console.error('❌ [EXAM] DeepSeek error:', deepSeekError);
          if (/one full practice exam per day|UPGRADE_REQUIRED/i.test(`${deepSeekError?.message || ''} ${JSON.stringify(deepSeekError?.data || deepSeekError?.response?.data || {})}`)) {
            message.warning({ content: 'Free accounts include one full practice exam per day. Upgrade for unlimited exams and certificates.', key: 'loading', duration: 8 });
            setExamFlowStep('setup');
            setLoading(false);
            return;
          }
          console.error('❌ [EXAM] Error stack:', deepSeekError.stack);
          debugExam('DEEPSEEK_ERROR', {
            errorMessage: deepSeekError.message,
            errorStack: deepSeekError.stack,
            errorName: deepSeekError.name
          }, 'DeepSeek API call threw exception');

          console.warn('⚠️ [EXAM] Falling back to backend');
          const result = await generateExamFromBackend(userId, 100);
          if (!result) {
            console.error('❌ [EXAM] Backend fallback failed');
            setExamFlowStep('setup');
            setLoading(false);
            return;
          }
          examData = result.examData;
          sessionId = result.sessionId;
          questionsList = result.questionsList;
        }
      } else {
        // Regular users - Use backend
        const numQuestions = userPlan === 'basic' ? 20 : 100;
        console.log(`📚 [EXAM] Using backend with ${numQuestions} questions`);
        debugExam('BACKEND_START', {
          numQuestions,
          userId,
          userName,
          userPlan
        }, 'Starting backend exam generation');

        const result = await generateExamFromBackend(userId, numQuestions);
        if (!result) {
          console.error('❌ [EXAM] Backend generation failed');
          debugExam('BACKEND_FAILED', null, 'Backend generation returned null');
          setExamFlowStep('setup');
          setLoading(false);
          return;
        }
        examData = result.examData;
        sessionId = result.sessionId;
        questionsList = result.questionsList;

        debugExam('BACKEND_SUCCESS', {
          sessionId,
          questionsCount: questionsList.length,
          examDataKeys: Object.keys(examData || {})
        }, 'Backend exam generation successful');
      }

      // ============================================================
      // STEP 2: VALIDATE AND LOG FINAL STATE
      // ============================================================
      console.log('%c📊 FINAL STATE CHECK', 'color: #ff6b00; font-weight: bold; font-size: 16px');
      console.log('  - sessionId:', sessionId);
      console.log('  - sessionId type:', typeof sessionId);
      console.log('  - questionsList length:', questionsList?.length || 0);
      console.log('  - examData:', examData ? 'present' : 'null');

      debugExam('FINAL_STATE', {
        sessionId,
        sessionIdType: typeof sessionId,
        questionsCount: questionsList?.length || 0,
        hasExamData: !!examData,
        examDataKeys: Object.keys(examData || {})
      }, 'Final state after exam generation');

      // CRITICAL: Validate session ID
      if (!sessionId) {
        console.error('❌ [EXAM] No session ID - generating fallback');
        sessionId = `EXAM-FALLBACK-${Date.now()}`;
        console.log('🆕 [EXAM] Fallback session ID:', sessionId);
        debugExam('SESSION_ID_FALLBACK', { sessionId }, 'No session ID found, using generated fallback');
      }

      // Validate questions
      if (!questionsList || questionsList.length === 0) {
        console.error('❌ [EXAM] No questions - trying emergency fallback');
        debugExam('NO_QUESTIONS', {
          questionsList,
          examData: examData ? 'present' : 'null'
        }, 'Questions list is empty, using fallback questions');

        throw new Error('The exam could not be prepared. Please try again in a moment.');
      }

      console.log('📊 [EXAM] Final counts:');
      console.log('  - Questions:', questionsList.length);
      console.log('  - Session ID:', sessionId);

      // ============================================================
      // STEP 3: BUILD FRONTEND EXAM
      // ============================================================
      debugExam('BUILD_EXAM_START', {
        questionsCount: questionsList.length,
        sessionId,
        examDataKeys: Object.keys(examData || {})
      }, 'Building frontend exam object');

      const frontendExam = buildExamObject(questionsList, examData, sessionId);

      debugExam('BUILD_EXAM_RESULT', {
        examTitle: frontendExam.title,
        examQuestions: frontendExam.questions?.length || 0,
        examSessionId: frontendExam.session_id,
        examId: frontendExam.exam_id
      }, 'Frontend exam object built');

      // ============================================================
      // STEP 4: SET ALL STATE
      // ============================================================
      console.log('%c📌 SETTING STATE', 'color: #00aa00; font-weight: bold; font-size: 16px');
      console.log('  - Setting activeExam with', frontendExam.questions.length, 'questions');
      console.log('  - Setting examSessionId to:', sessionId);
      console.log('  - Setting localStorage exam_session_id:', sessionId);

      setActiveExam(frontendExam);
      setUserAnswers({});
      setExamScore(null);
      setActivePdfSection(0);
      setExamSessionId(sessionId);
      localStorage.setItem('exam_session_id', sessionId);

      // Verify state was set
      console.log('✅ State set, verifying...');
      console.log('  - examSessionId now:', examSessionId); // This will show stale value due to React batching

      // Track state after set
      debugExam('STATE_AFTER_SET', {
        examSessionId: sessionId,
        activeExamQuestions: frontendExam.questions?.length || 0,
        localStorageSessionId: localStorage.getItem('exam_session_id')
      }, 'State after React setState calls');

      // ============================================================
      // STEP 5: START TIMER
      // ============================================================
      console.log('⏱️ Starting exam timer...');
      startExamTimer(frontendExam);
      debugExam('TIMER_STARTED', {
        timeLimit: frontendExam.time_limit_minutes,
        totalQuestions: frontendExam.total_questions
      }, 'Exam timer started');

      // ============================================================
      // STEP 6: SHOW SUCCESS
      // ============================================================
      setExamFlowStep('taking_exam');
      const source = examData?.source === 'deepseek' ? 'DeepSeek AI' : 'backend';
      message.success(`✅ Practice exam ready! ${questionsList.length} questions from ${source}.`);

      debugExam('EXAM_READY', {
        source,
        questionsCount: questionsList.length,
        sessionId,
        flowStep: 'taking_exam'
      }, 'Exam is ready for user');

    } catch (error) {
      console.error('%c❌❌❌ FATAL EXAM ERROR ❌❌❌', 'color: red; font-weight: bold; font-size: 20px');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      debugExam('FATAL_ERROR', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      }, 'Fatal error in exam flow');

      message.error('Failed to start exam. Please try again.');
      setExamFlowStep('setup');
    } finally {
      setLoading(false);
      console.log('%c🔵 EXAM FLOW COMPLETED', 'color: #0066cc; font-weight: bold; font-size: 16px');
      console.log('%c' + '='.repeat(80), 'color: #ff6b00');
    }
  };

  const generateExamFromBackend = async (userId, numQuestions) => {
    console.log('🔄 [AI] Requesting exam from backend...');

    try {
      message.loading({
        content: 'Generating your practice exam with AI... (2-3 minutes)',
        key: 'gen',
        duration: 0
      });

      // 🔴 SINGLE CALL — no fallback logic here
      const response = await apiPost('/deepseek/generate-exam', {
        topic: selectedExamTopic || 'csp_exam',
        count: numQuestions || 100,
        difficulty: 'advanced',
      });

      message.destroy('gen');
      const result = response?.data || response;

      // 🔴 Backend GUARANTEES success with questions
      if (!result?.success || !result?.questions || result.questions.length === 0) {
        throw new Error(result?.error || 'Backend returned no questions (unexpected)');
      }

      const sessionId = result.session_id;
      setExamSessionId(sessionId);
      localStorage.setItem('exam_session_id', sessionId);

      console.log(`✅ Received ${result.questions.length} questions from backend`);
      console.log(`📊 Source: ${result.source}`);
      console.log(`📊 Domains: ${result.domain_breakdown}`);

      const questionsList = result.questions.map((q, i) => formatQuestion(q, i, true));

      const examData = {
        exam_id: sessionId,
        exam_type: 'CSP_AI_EXAM',
        domain: selectedExamTopic || 'csp_exam',
        total_questions: questionsList.length,
        passing_score: 75,
        time_limit_minutes: 240,
        generated_at: new Date().toISOString(),
        source: result.source,
        domain_breakdown: result.domain_breakdown,
        saved_to: result.saved_to,
      };

      return { examData, sessionId, questionsList };

    } catch (error) {
      message.destroy('gen');
      console.error('❌ Exam generation failed:', error);
      message.error('Failed to generate exam. Please try again.');
      return null;  // ← Single failure = user sees error, no auto-retry
    }
  };

  // ============================================================
  // HELPER: Build Exam Object
  // ============================================================
  const buildExamObject = (questionsList, examData, sessionId) => {
    const isDeepSeek = examData?.source === 'deepseek';
    const isBasic = userPlan === 'basic';

    return {
      title: isDeepSeek ? `${PRACTICE_EXAM_NAME} (AI-generated)` :
        (isBasic ? `${PRACTICE_EXAM_NAME} (short)` : PRACTICE_EXAM_NAME),
      description: isDeepSeek ? 'CSP-style practice exam with AI-generated questions (100 questions, 4 hours)' :
        (isBasic ? 'Practice exam with 20 questions' : 'CSP-style practice exam (100 questions, 4 hours)'),
      industry: selectedIndustry,
      difficulty: isDeepSeek ? 'Advanced, CSP-style (AI)' :
        (isBasic ? 'Intermediate Level' : 'Advanced, CSP-style'),
      candidate_name: userName,
      course: selectedCourseForExam || 'CSP Exam Preparation (practice)',
      exam_id: examData?.exam_id || `EXAM-${Date.now()}`,
      session_id: sessionId,
      exam_mode: examData?.exam_type || (isDeepSeek ? 'CSP_FULL_EXAM_DEEPSEEK' : 'CSP_FULL_EXAM'),
      source: isDeepSeek ? 'deepseek' : 'backend',
      plan_used: userPlan,
      questions: questionsList.map((q, index) => formatQuestion(q, index, isDeepSeek)),
      instructions: `Complete all ${questionsList.length} questions within 4 hours. Passing score is 75%.`,
      passing_score: 75,
      time_limit_minutes: 240,
      total_questions: questionsList.length,
      total_points: questionsList.reduce((sum, q) => sum + (q.points || 2), 0),
      generated_at: examData?.generated_at || new Date().toISOString(),
      topic: examData?.domain || selectedExamTopic,
      csp_blueprint_aligned: true
    };
  };

  // ============================================================
  // HELPER: Format Question
  // ============================================================
  const formatQuestion = (q, index, isDeepSeek) => {
    // Format options
    let options = [];
    const rawOptions = q.options || [];

    if (Array.isArray(rawOptions) && rawOptions.length > 0) {
      if (typeof rawOptions[0] === 'object' && rawOptions[0] !== null) {
        options = rawOptions.map(opt => opt.text || opt.option || `Option ${opt.letter || ''}`);
      } else {
        options = rawOptions.map(opt => String(opt).replace(/^[A-D][\.\)\-]\s*/i, '').trim());
      }
    } else if (typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
      options = Object.values(rawOptions).map(opt => {
        if (typeof opt === 'object') {
          return opt.text || opt.option || String(opt);
        }
        return String(opt).replace(/^[A-D][\.\)\-]\s*/i, '').trim();
      });
    } else {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }

    // Ensure at least 4 options
    while (options.length < 4) {
      options.push(`Option ${String.fromCharCode(65 + options.length)}`);
    }

    // Parse correct answer
    let correctAnswer = 'A';
    if (q.correct_answer) {
      const ans = String(q.correct_answer).toUpperCase().trim();
      if (['A', 'B', 'C', 'D'].includes(ans)) {
        correctAnswer = ans;
      } else {
        const num = parseInt(ans);
        if (!isNaN(num) && num >= 1 && num <= 4) {
          correctAnswer = String.fromCharCode(64 + num);
        }
      }
    }

    // 🔴 FIXED: Keep correct_answer as the letter (e.g., 'A'), NOT the index (0)
    return {
      id: q.id || `q_${index}_${Date.now()}`,
      question_text: q.question_text || q.question || `Question ${index + 1}`,
      question: q.question_text || q.question || `Question ${index + 1}`,
      type: q.question_type || 'application',
      options: options,
      correct_answer: correctAnswer,           // Now a string: 'A', 'B', 'C', or 'D'
      correct_answer_letter: correctAnswer,    // Kept for safety
      explanation: q.explanation || (isDeepSeek ? 'AI-generated explanation based on safety-professional practice.' : 'Based on safety-professional judgment.'),
      points: q.points || 2,
      difficulty: q.difficulty || (isDeepSeek ? 'advanced' : 'intermediate'),
      cognitive_level: q.cognitive_level || 'application',
      domain: q.domain || 'Domain 2',
      regulatory_reference: q.reference || '',
      scenario_context: q.scenario_context || ''
    };
  };

  // ============================================================
  // HELPER: Start Exam Timer
  // ============================================================
  const startExamTimer = (exam) => {
    if (!exam?.time_limit_minutes) return;

    autoSubmitFiredRef.current = false;

    const timeLimit = exam.time_limit_minutes;
    setExamProgress({
      answered: 0,
      total: exam.questions.length,
      timeRemaining: timeLimit * 60
    });

    // Clear existing timer
    if (examTimer) {
      clearInterval(examTimer);
    }

    const timer = setInterval(() => {
      setExamProgress(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          handleAutoSubmitExam();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    setExamTimer(timer);
  };

  const handleAutoSubmitExam = () => {
    // Fire only once, even if the timer callback runs twice (e.g. React StrictMode)
    if (autoSubmitFiredRef.current) return;
    autoSubmitFiredRef.current = true;

    message.warning('⏰ Time is up! Auto-submitting exam...');
    // Deferred so it runs after React commits, using the latest render's
    // activeExam / userAnswers / examSessionId. Skips the "unanswered" confirm
    // dialog because time has expired.
    setTimeout(() => performSubmitRef.current?.(), 0);
  };

  const getUserId = () => {
    if (userEmail && userEmail.trim() !== '') {
      return `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    }
    if (userName && userName.trim() !== '') {
      return `user_${userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    }
    return `user_${Date.now()}`;
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    // Force everything to be a single uppercase letter ('A', 'B', 'C', 'D')
    let letter = answer;

    // If a number (0, 1, 2, 3) was passed by the Radio button, convert to letter
    if (typeof answer === 'number' || !isNaN(parseInt(answer))) {
      const idx = parseInt(answer, 10);
      if (idx >= 0 && idx <= 3) {
        letter = String.fromCharCode(65 + idx); // 0 -> 'A', 1 -> 'B'
      }
    }

    // If it's a string like "A) ...", extract just the letter
    if (typeof letter === 'string') {
      letter = letter.trim().toUpperCase().charAt(0);
    }

    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: letter
    }));

    setExamProgress(prev => {
      const answeredCount = Object.keys({ ...prev.answers, [questionIndex]: letter }).length;
      return {
        ...prev,
        answered: answeredCount,
        answers: { ...prev.answers, [questionIndex]: letter },
        percentage: Math.round((answeredCount / prev.total) * 100)
      };
    });
  };

  const handleSubmitExam = async () => {
    console.log('📤 Submitting exam...');

    // ✅ Check if activeExam exists
    if (!activeExam) {
      message.error('No active exam to submit');
      return;
    }

    const totalQuestions = activeExam.questions?.length || 0;
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < totalQuestions) {
      Modal.confirm({
        title: 'Submit with unanswered questions?',
        content: `You have answered ${answeredCount} out of ${totalQuestions} questions. ${totalQuestions - answeredCount} questions are unanswered. Are you sure you want to submit?`,
        okText: 'Yes, Submit',
        cancelText: 'Continue Exam',
        onOk: () => performSubmit()
      });
      return;
    }

    performSubmit();
  };

  const performSubmit = async () => {
    try {
      message.loading({ content: 'Submitting exam...', key: 'submit', duration: 0 });

      // ✅ If no examSessionId, create one
      let sessionId = examSessionId;
      if (!sessionId) {
        sessionId = `EXAM-${Date.now()}`;
        setExamSessionId(sessionId);
      }

      // 🔴 FIXED: userAnswers stores letters ('A', 'B', 'C', 'D') NOT indexes.
      // The old code did `String.fromCharCode(65 + answerIndex)` which
      // produced '\x00' when answerIndex was 'A' (NaN). Fix: just pass through.
      const formattedAnswers = {};
      Object.entries(userAnswers).forEach(([qIndex, answer]) => {
        const letter = String(answer).toUpperCase().charAt(0);
        formattedAnswers[qIndex] = {
          index: parseInt(qIndex, 10),
          letter: letter,       // 'A', 'B', 'C', 'D'
          value: letter
        };
      });

      console.log('📤 Sending formatted answers to backend:', formattedAnswers);

      // Submit to backend
      const submitResult = await AIService.submitExamForGrading(
        sessionId,
        formattedAnswers,
        userPlan
      );

      if (submitResult?.success) {
        const detailedResults = submitResult.grading_result?.detailed_results || [];

        // 🔴 FIXED: Backend may send `domain` OR `domain_name` — map both
        const mappedResults = detailedResults.map(result => ({
          question: result.question_text || `Question ${result.question_number}`,
          userAnswer: result.user_answer || 'Not answered',
          correctAnswer: result.correct_answer || 'Not available',
          isCorrect: result.is_correct || false,
          explanation: result.explanation || 'No explanation provided',
          points: result.points || 1,
          points_earned: result.points_earned || 0,
          domain: result.domain || result.domain_name || 'CSP General'
        }));

        setExamScore({
          score: submitResult.grading_result?.percentage || 0,
          correct: submitResult.grading_result?.correct_answers || 0,
          total: submitResult.grading_result?.total_questions || activeExam.questions.length,
          percentage: submitResult.grading_result?.percentage || 0,
          passed: submitResult.grading_result?.passed || false,
          results: mappedResults,
          professional_analysis: submitResult.professional_analysis || {}
        });

        setExamFlowStep('results');
        message.success({
          content: `✅ Exam submitted! Score: ${submitResult.grading_result?.percentage || 0}%`,
          key: 'submit'
        });
      } else {
        // Fallback to local grading — but first kill the loading toast
        message.destroy('submit');
        performLocalGrading();
      }
    } catch (error) {
      console.error('❌ Submit exception:', error);
      message.destroy('submit');
      performLocalGrading();
    }
  };

  // Exams are graded on the server only (the answer key never reaches the browser).
  const performLocalGrading = () => {
    message.destroy('submit');
    message.destroy('loading');
    message.error({ content: 'We could not submit your exam. Your answers are still here - please press Submit again.', duration: 8 });
  };

  // 🔴 FIX 4 (continued): Handle BOTH "A) option" and "A. option" formats
  const getOptionText = (options, letter) => {
    if (!options || !letter) return 'N/A';

    const cleanLetter = String(letter).toUpperCase().charAt(0);

    // Try to find the full option text (e.g., "A) Elimination")
    const option = options.find(opt => {
      const cleaned = String(opt).trim().toUpperCase();
      return cleaned.startsWith(`${cleanLetter})`) ||
        cleaned.startsWith(`${cleanLetter}.`) ||
        cleaned.startsWith(`${cleanLetter} `);
    });

    // Return the matched option, or a clean fallback instead of "Not found"
    return option || `Option ${cleanLetter}`;
  };

  const handleGenerateCertificateFromExam = async () => {
    if (!examScore?.passed) {
      message.error('You must pass the exam to receive a certificate');
      return;
    }

    try {
      message.loading({ content: 'Generating your professional certificate...', key: 'cert_gen' });

      const certificateResult = await AIService.generateExamCertificate(examSessionId, userPlan);

      if (certificateResult.success) {
        const credential = getCredentialLevel(examScore.score);

        const certificateData = {
          ...certificateResult.certificate,
          recipient_name: userName,
          course_title: selectedCourseForExam,
          exam_score: examScore.score,
          exam_date: new Date().toISOString().split('T')[0],
          credential_level: credential.level,
          admin_signature: {
            name: adminSignature.name,
            title: adminSignature.title,
            signature_id: adminSignature.signature_id
          }
        };

        setGeneratedCertificate(certificateData);
        setExamFlowStep('certificate');
        message.success({ content: 'Certificate of completion created', key: 'cert_gen' });
      } else {
        throw new Error(certificateResult.error || 'Backend generation failed');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      // No local fallback: a certificate that is not in our records could never be verified.
      message.error({ content: /plan|upgrade/i.test(error?.message || '') ? 'Your exam result is free. Choose any paid plan to download the certificate of completion.' : 'Could not create your certificate right now. Please try again in a moment.', key: 'cert_gen', duration: 8 });
    }
  };

  const handleDownloadExamCertificate = async () => {
    const certificateToDownload = generatedCertificate;

    const certId = certificateToDownload?.certificate_id;

    if (!certId) {
      message.error('No certificate ID found');
      return;
    }

    try {
      const response = await fetch(`${backendOrigin()}/api/ai/exam/flow/certificate/${encodeURIComponent(certId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.download_url) {
          window.open(/^https?:/.test(data.download_url) ? data.download_url : `${backendOrigin()}${data.download_url}`, '_blank', 'noopener');
          message.success('Download started!');
        } else {
          message.error('No download URL found');
        }
      } else {
        message.error('Failed to get certificate');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Download failed');
    }
  };

  const handleDownloadTranscript = async () => {
    if (!examScore) return;

    try {
      message.loading({ content: 'Preparing transcript download...', key: 'transcript', duration: 0 });

      const transcriptData = {
        recipient_name: userName,
        course_title: selectedCourseForExam,
        exam_results: examScore,
        exam_details: activeExam,
        exam_date: new Date().toISOString().split('T')[0],
        company_info: companyInfo.useCompanyInfo ? companyInfo : {}
      };

      const response = await AIService.downloadTranscriptAsPdf?.(transcriptData, userPlan);

      if (response?.success && response.download_url) {
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = `Transcript_${userName}_${selectedCourseForExam}_${Date.now()}.pdf`;
        link.click();
        message.success({ content: 'Transcript downloaded successfully!', key: 'transcript' });
      } else {
        generateFallbackTranscriptPdf();
      }
    } catch (error) {
      console.error('Transcript download error:', error);
      generateFallbackTranscriptPdf();
    }
  };

  const generateFallbackTranscriptPdf = () => {
    const credential = getCredentialLevel(examScore?.score || 0);

    const transcriptContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                 SAFETY PROFESSIONAL PRACTICE EXAM (CSP-STYLE)               ║
║                            PRACTICE TRANSCRIPT                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  CANDIDATE INFORMATION:                                                      ║
║  ────────────────────────────────────────────────────────────────────────── ║
║  Name:           ${userName}                                                 ║
║  Course:         ${selectedCourseForExam}                                    ║
║  Exam Date:      ${new Date().toLocaleDateString()}                          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  EXAM RESULTS SUMMARY:                                                       ║
║  ────────────────────────────────────────────────────────────────────────── ║
║                                                                              ║
║  Overall Score:          ${examScore?.score}%                                ║
║  Correct Answers:        ${examScore?.correct} / ${examScore?.total}        ║
║  Result:                 ${examScore?.passed ? 'PASSED ✓' : 'FAILED ✗'}     ║
║  Result Band:            ${credential.level}                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

${PRACTICE_DISCLAIMER}

Generated by SafeTrack Pro Global | ${new Date().toLocaleString()}
    `;

    const blob = new Blob([transcriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transcript_${userName}_${selectedCourseForExam}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    message.success({ content: 'Transcript downloaded successfully!', key: 'transcript' });
  };

  // ============= CERTIFICATE VERIFICATION FUNCTIONS =============
  const handleVerifyCertificate = async () => {
    if (!verificationCode.trim()) {
      message.warning('Please enter a certificate ID');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const id = verificationCode.trim();
      const res = await fetch(`${backendOrigin()}/api/ai/certificates/verify/${encodeURIComponent(id)}`);
      const body = await res.json().catch(() => ({}));
      const cert = body.certificate;
      if (!res.ok || !body.valid || !cert) {
        throw new Error(body.message || 'Certificate not found. Please check the ID and try again.');
      }
      setVerificationResult({ ...cert, valid: true, verifiedAt: new Date().toISOString() });
      message.success('Certificate found in SafeTrack records');
    } catch (error) {
      setVerificationResult({
        valid: false,
        message: error.message || 'Certificate not found. Please check the ID and try again.',
        verifiedAt: new Date().toISOString()
      });
      message.error('Certificate not found');
    } finally {
      setVerifying(false);
    }
  };

  const handleScanQR = () => {
    message.info('QR scanning feature coming soon. Please enter the certificate ID manually.');
  };

  const handleCopyVerificationLink = () => {
    if (verificationResult?.certificate_id) {
      const link = `${window.location.origin}/verify/${verificationResult.certificate_id}`;
      navigator.clipboard.writeText(link);
      message.success('Verification link copied to clipboard!');
    }
  };

  // ============= RENDER FUNCTIONS =============
  const renderExamFlowCard = () => (
    <Card
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>{PRACTICE_EXAM_NAME}</span>
          <Tag color="orange" style={{ fontSize: '12px' }}>CSP-STYLE PRACTICE</Tag>
        </Space>
      }
      className="feature-card exam-generator-card"
      style={{ marginTop: 16, border: '2px solid #fa8c16' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          message="Practice for the CSP® exam - this is not the official exam"
          description={PRACTICE_DISCLAIMER}
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
        />

        <div style={{ padding: '16px', backgroundColor: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
          <div style={{ marginBottom: '12px' }}>
            <Text strong style={{ color: '#fa8c16' }}>Practice result bands:</Text>
            <div style={{ marginLeft: '20px', fontSize: '12px' }}>
              <div>🏆 <strong>Platinum:</strong> 90%+</div>
              <div>🥇 <strong>Gold:</strong> 85%+</div>
              <div>🥈 <strong>Silver:</strong> 80%+</div>
              <div>🥉 <strong>Bronze:</strong> 75%+</div>
              <div>✅ <strong>Pass:</strong> 70%+</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <Text strong style={{ color: '#fa8c16' }}>Exam Details:</Text>
            <div style={{ marginLeft: '20px', fontSize: '12px' }}>
              <div>• 100 complex scenario-based questions</div>
              <div>• 4-hour time limit for realistic pacing</div>
              <div>• Topics follow the published CSP exam outline</div>
              <div>• Safety calculations, regulations and professional judgment</div>
              <div>• Instant score with an explanation for every answer</div>
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={handleStartExamFlow}
          loading={loading}
          block
          style={{
            height: '45px',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #fa8c16, #f5222d)',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Start Practice Exam
        </Button>

        <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
          Independent practice tool. CSP® is a registered mark of the Board of Certified Safety Professionals (BCSP).
          <br />
          <Badge status="processing" text="Certificate of completion with online verification" />
        </div>
      </Space>
    </Card>
  );

  // Certificate Verification card (was inline in the "Exams & Verification" tab)
  const renderVerificationCard = () => (
    <Card title={<Space><VerifiedOutlined /><span>Certificate Verification</span><Tag color="green">Online check</Tag></Space>} style={{ border: '1px solid #52c41a' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <VerifiedOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Title level={4} style={{ marginTop: 16 }}>Verify Certificate Authenticity</Title>
          <Text type="secondary">Verify any SafetyTrack Pro certificate using its unique ID.</Text>
        </div>
        <div><Input placeholder="Enter certificate ID" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} prefix={<QrcodeOutlined />} size="large" /></div>
        <Row gutter={[8, 8]}>
          <Col span={12}><Button type="primary" icon={<VerifiedOutlined />} onClick={() => setVerificationModalVisible(true)} block>Verify Now</Button></Col>
          <Col span={12}><Button icon={<ScanOutlined />} onClick={handleScanQR} block>Scan QR Code</Button></Col>
        </Row>
        <Divider />
        <div style={{ fontSize: 12, color: '#666' }}>
          <Text strong>Features:</Text>
          <ul style={{ marginTop: 8 }}>
            <li>✓ Checked against SafeTrack Pro Global records</li>
            <li>✓ Shows recipient, score and issue date</li>
            <li>✓ Confirms it is a practice-exam certificate of completion</li>
          </ul>
        </div>
      </Space>
    </Card>
  );

  // ============= EXAM MODAL RENDER FUNCTIONS =============

  // Exam Setup Modal
  const renderExamSetupModal = () => (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>{PRACTICE_EXAM_NAME} - Setup</span>
          <Tag color="orange">PRACTICE</Tag>
        </Space>
      }
      open={examModalVisible && examFlowStep === 'setup'}
      onCancel={() => {
        setExamModalVisible(false);
        setExamFlowStep('setup');
        localStorage.removeItem('exam_session_id');
      }}
      width={650}
      footer={[
        <Button key="cancel" onClick={() => {
          setExamModalVisible(false);
          setExamFlowStep('setup');
          localStorage.removeItem('exam_session_id');
        }}>
          Cancel
        </Button>,
        <Button
          key="start"
          type="primary"
          onClick={handleProceedToExam}
          disabled={!userName.trim()}
          loading={loading}
          style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }}
        >
          Begin Practice Exam
        </Button>
      ]}
    >
      <div className="exam-setup-container">
        <Alert
          message="Practice exam - not the official CSP® exam"
          description={PRACTICE_DISCLAIMER}
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Form layout="vertical">
          <Form.Item label={
            <Space>
              <UserOutlined />
              <span>Full Name (as it will appear on the certificate of completion)</span>
            </Space>
          } required>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full professional name"
              size="large"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item label={
            <Space>
              <Checkbox />
              <span>Email Address (for certificate delivery)</span>
            </Space>
          }>
            <Input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="professional@example.com"
              size="large"
              prefix={<Checkbox />}
            />
          </Form.Item>

          <Divider />

          <Card size="small" title="Exam Specifications" style={{ border: '1px solid #ffd591', backgroundColor: '#fff7e6' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><Text strong>Questions:</Text><Tag color="blue" style={{ marginLeft: 8 }}>100</Tag></div>
                <div><Text strong>Time Limit:</Text><Tag color="red" style={{ marginLeft: 8 }}>4 hours</Tag></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div><Text strong>Passing Score:</Text><Tag color="green" style={{ marginLeft: 8 }}>70% (70/100)</Tag></div>
                <div><Text strong>Certificate:</Text><Tag color="purple" style={{ marginLeft: 8 }}>Completion (practice)</Tag></div>
              </div>
            </Space>
          </Card>
        </Form>
      </div>
    </Modal>
  );

  // Exam Taking Modal
  const renderExamTakingModal = () => {
    if (!activeExam) return null;

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = activeExam.questions?.[activePdfSection] || {};

    return (
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>{PRACTICE_EXAM_NAME}</span>
            <Tag color="orange">ADVANCED</Tag>
            <Badge
              count={formatTime(examProgress.timeRemaining)}
              style={{ backgroundColor: examProgress.timeRemaining < 1800 ? '#ff4d4f' : '#1890ff' }}
            />
            <Progress
              percent={Math.round((Object.keys(userAnswers).length / activeExam.questions?.length) * 100)}
              size="small"
              style={{ width: 100 }}
            />
          </Space>
        }
        open={examModalVisible && examFlowStep === 'taking_exam'}
        onCancel={() => {
          Modal.confirm({
            title: 'Exit the practice exam?',
            content: <div><p>Are you sure you want to exit? Your progress will be lost.</p><p style={{ fontSize: '12px', color: '#fa8c16' }}><WarningOutlined /> This exam is time-sensitive and cannot be resumed.</p></div>,
            okText: 'Exit Exam',
            cancelText: 'Continue Exam',
            okButtonProps: { danger: true },
            onOk: () => {
              if (examTimer) clearInterval(examTimer);
              setExamModalVisible(false);
              setExamFlowStep('setup');
              localStorage.removeItem('exam_session_id');
            }
          });
        }}
        width={900}
        footer={[
          <Button key="prev" onClick={() => setActivePdfSection(prev => Math.max(0, prev - 1))} disabled={activePdfSection === 0} icon={<LeftOutlined />}>
            Previous
          </Button>,
          <div key="progress" style={{ flex: 1, textAlign: 'center' }}>
            <Text strong>Question {activePdfSection + 1} of {activeExam.questions?.length}</Text>
            <div style={{ fontSize: '12px', color: '#666' }}>Points: {currentQuestion.points || 2} • Domain: {currentQuestion.domain || 'Advanced Sciences'}</div>
          </div>,
          <Button key="next" onClick={() => setActivePdfSection(prev => Math.min(activeExam.questions?.length - 1, prev + 1))} disabled={activePdfSection === activeExam.questions?.length - 1} icon={<RightOutlined />}>
            Next
          </Button>,
          <Divider type="vertical" key="divider" />,
          <Button key="submit" type="primary" onClick={handleSubmitExam} disabled={Object.keys(userAnswers).length < activeExam.questions?.length} style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }}>
            Submit Exam ({Object.keys(userAnswers).length}/{activeExam.questions?.length})
          </Button>
        ]}
      >
        <div className="exam-taking-container">
          <Alert
            message={`${PRACTICE_EXAM_NAME} (CSP-style)`}
            description={<Space split={<Divider type="vertical" />} wrap>
              <span><UserOutlined /> {userName}</span>
              <span><ClockCircleOutlined /> Time Limit: 4 hours</span>
              <span><BookOutlined /> 100 Questions</span>
              <span><SafetyCertificateOutlined /> Practice mode</span>
            </Space>}
            type="warning"
            showIcon
            icon={<SafetyCertificateOutlined />}
            style={{ marginBottom: 16 }}
          />

          <div className="exam-questions">
            <Card style={{ marginBottom: 16 }}
              title={
                <Space>
                  <Tag color="blue">Question {activePdfSection + 1}</Tag>
                  <Tag color="cyan">{currentQuestion.domain || 'Advanced Sciences'}</Tag>
                  <Tag color="green">{currentQuestion.points || 2} points</Tag>
                  {currentQuestion.difficulty === 'advanced' && <Tag color="orange">Advanced</Tag>}
                </Space>
              }
              extra={<Tag color={userAnswers[activePdfSection] !== undefined ? 'green' : 'default'}>{userAnswers[activePdfSection] !== undefined ? 'Answered' : 'Not Answered'}</Tag>}
            >
              <div style={{ marginBottom: 20, fontSize: '16px', lineHeight: 1.6 }}>
                <div style={{ backgroundColor: '#e6f7ff', padding: '12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '4px solid #1890ff' }}>
                  <Text strong style={{ color: '#1890ff' }}><SafetyCertificateOutlined /> Professional Scenario:</Text>
                  <div style={{ marginTop: '8px' }}>
                    {currentQuestion.question_text || currentQuestion.question || `Practice question ${activePdfSection + 1}`}
                  </div>
                </div>

                {currentQuestion.scenario_context && (
                  <div style={{ backgroundColor: '#fff7e6', padding: '12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '4px solid #fa8c16' }}>
                    <Text strong style={{ color: '#fa8c16' }}><ExperimentOutlined /> Context:</Text>
                    <div style={{ marginTop: '8px', fontSize: '14px' }}>{currentQuestion.scenario_context}</div>
                  </div>
                )}
              </div>

              <Radio.Group
                value={userAnswers[activePdfSection]}
                onChange={(e) => {
                  handleAnswerSelect(activePdfSection, e.target.value);
                }}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, optIndex) => {
                      const optionLetter = String.fromCharCode(65 + optIndex);
                      let optionText = '';

                      if (typeof option === 'string') {
                        optionText = option.replace(/^[A-D][\.\)\-]\s*/i, '').trim();
                      } else if (option && typeof option === 'object') {
                        optionText = option.text || option.value || option.label || `Option ${optionLetter}`;
                        optionText = String(optionText).replace(/^[A-D][\.\)\-]\s*/i, '').trim();
                      } else {
                        optionText = `Option ${optionLetter}`;
                      }

                      // userAnswers stores letters ('A'..'D'), so compare/select by letter
                      const isSelected = userAnswers[activePdfSection] === optionLetter;

                      return (
                        <Radio
                          key={optIndex}
                          value={optionLetter}
                          style={{
                            display: 'block',
                            padding: '12px 16px',
                            margin: '8px 0',
                            border: isSelected ? '2px solid #1890ff' : '1px solid #e8e8e8',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#e6f7ff' : '#fafafa',
                            transition: 'all 0.2s ease',
                            width: '100%'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#1890ff' : '#d9d9d9',
                              color: isSelected ? '#fff' : '#666',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '12px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                              fontSize: '12px'
                            }}>
                              {optionLetter}
                            </div>
                            <div style={{ flex: 1, fontSize: '14px', lineHeight: 1.5, color: '#333' }}>
                              {optionText}
                            </div>
                          </div>
                        </Radio>
                      );
                    })
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', color: '#ff4d4f', backgroundColor: '#fff2f0', borderRadius: 8 }}>
                      <WarningOutlined /> No options available. Please refresh and try again.
                    </div>
                  )}
                </Space>
              </Radio.Group>
            </Card>
          </div>
        </div>
      </Modal>
    );
  };

  // Exam Results Modal
  const renderExamResultsModal = () => {
    if (!examScore) return null;

    const credential = getCredentialLevel(examScore.score);

    return (
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>Professional Exam Results</span>
            <Tag color={credential.color}>{credential.level.toUpperCase()}</Tag>
          </Space>
        }
        open={examModalVisible && examFlowStep === 'results'}
        onCancel={() => {
          setExamModalVisible(false);
          setExamFlowStep('setup');
          localStorage.removeItem('exam_session_id');
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => {
            setExamModalVisible(false);
            setExamFlowStep('setup');
            localStorage.removeItem('exam_session_id');
          }}>Close</Button>,
          <Button key="review" onClick={() => { setExamFlowStep('taking_exam'); setActivePdfSection(0); }} icon={<EyeOutlined />}>Review Answers</Button>,
          examScore.passed ? (
            <Button key="certificate" type="primary" onClick={handleGenerateCertificateFromExam} style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }} icon={<SafetyCertificateOutlined />}>
              Get Certificate of Completion
            </Button>
          ) : (
            <Button key="retry" type="primary" onClick={() => { setExamFlowStep('setup'); setUserAnswers({}); setExamScore(null); setActivePdfSection(0); }}>Retry Exam</Button>
          )
        ]}
      >
        <div className="exam-results-container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '60px', color: credential.color, marginBottom: 8 }}>{examScore.passed ? '🏆' : '📝'}</div>
            <Title level={3} style={{ color: credential.color }}>{examScore.passed ? 'Practice exam passed!' : 'Practice exam results'}</Title>
            <div style={{ fontSize: '42px', fontWeight: 'bold', color: credential.color, margin: '16px 0' }}>{examScore.score}%</div>
            <div style={{ backgroundColor: credential.color + '10', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <Text strong style={{ color: credential.color }}>{credential.level} result band • practice exam</Text>
            </div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>{examScore.correct} out of {examScore.total} correct answers</div>
          </div>

          <Divider />

          <Title level={5}>Detailed Performance Analysis:</Title>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Correct Answers" value={examScore.correct} suffix={`/ ${examScore.total}`} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Percentage" value={examScore.score} suffix="%" valueStyle={{ color: '#1890ff' }} prefix={<PercentageOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Result band" value={credential.level} valueStyle={{ color: '#722ed1' }} prefix={<StarOutlined />} />
              </Card>
            </Col>
          </Row>

          <Tabs>
            <TabPane tab="Question Review" key="review">
              <List
                dataSource={examScore.results}
                renderItem={(result, index) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={<Avatar size="large" style={{ backgroundColor: result.isCorrect ? '#52c41a' : '#ff4d4f', color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{result.isCorrect ? '✓' : '✗'}</Avatar>}
                      title={`Question ${index + 1}`}
                      description={
                        <Space direction="vertical" size={2}>
                          <div style={{ fontWeight: 'bold' }}>{result.question}</div>
                          <div><Text strong>Your Answer: </Text><Text type={result.isCorrect ? "success" : "danger"}>{result.userAnswer}</Text></div>
                          {!result.isCorrect && <div><Text strong>Correct Answer: </Text><Text type="success">{result.correctAnswer}</Text></div>}
                          <div><Text strong>Explanation: </Text><Text type="secondary">{result.explanation}</Text></div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    );
  };

  // Exam Certificate Modal
  const renderExamCertificateModal = () => {
    if (!generatedCertificate) return null;

    const credential = getCredentialLevel(generatedCertificate.exam_score || examScore?.score || 0);

    return (
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>Certificate of Completion (practice exam)</span>
            <Tag color={credential.color} style={{ fontWeight: 'bold' }}>{credential.level.toUpperCase()}</Tag>
            <Tag color="green">{generatedCertificate.exam_score || examScore?.score}%</Tag>
          </Space>
        }
        open={examModalVisible && examFlowStep === 'certificate'}
        onCancel={() => {
          setExamModalVisible(false);
          setExamFlowStep('setup');
          localStorage.removeItem('exam_session_id');
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => { setExamModalVisible(false); setExamFlowStep('setup'); localStorage.removeItem('exam_session_id'); }}>Close</Button>,
          <Button key="share" icon={<ShareAltOutlined />} onClick={() => message.info('Share feature coming soon!')}>Share Certificate</Button>,
          <Button key="download-cert" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadExamCertificate} style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }}>Download Certificate of Completion (PDF)</Button>,
          <Button key="download-transcript" icon={<FilePdfOutlined />} onClick={handleDownloadTranscript} style={{ borderColor: credential.color, color: credential.color }}>Download Detailed Transcript</Button>
        ]}
      >
        <div className="certificate-container">
          <div style={{ border: `3px solid ${credential.color}`, padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '80px', color: `${credential.color}10`, fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 0 }}>PRACTICE EXAM</div>

            <div style={{ marginBottom: '30px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', letterSpacing: '2px' }}>SAFETRACK PRO GLOBAL</div>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '12px' }}>PRACTICE EXAM - NOT AN ACCREDITED CERTIFICATION</div>
              <Title level={1} style={{ margin: 0, color: credential.color, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                <SafetyCertificateOutlined /> CERTIFICATE OF COMPLETION <SafetyCertificateOutlined />
              </Title>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px', borderBottom: `1px solid ${credential.color}40`, paddingBottom: '12px' }}>{PRACTICE_EXAM_NAME} (CSP-style)</div>
            </div>

            <div style={{ margin: '30px 0', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>This certificate of completion is presented to</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: credential.color, margin: '20px 0', padding: '15px', borderTop: `2px solid ${credential.color}`, borderBottom: `2px solid ${credential.color}`, display: 'inline-block', letterSpacing: '1px' }}>
                {generatedCertificate.recipient_name || userName}
              </div>
              <div style={{ fontSize: '14px', color: '#666', margin: '20px 0' }}>for passing the practice exam</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#722ed1', margin: '20px 0', padding: '15px', backgroundColor: `${credential.color}10`, borderRadius: '8px', display: 'inline-block', border: `1px dashed ${credential.color}` }}>
                {generatedCertificate.course_title || selectedCourseForExam}
              </div>
              <div style={{ display: 'inline-block', margin: '20px auto', padding: '8px 24px', backgroundColor: credential.color, color: 'white', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', boxShadow: `0 4px 12px ${credential.color}40` }}>
                {credential.level} RESULT BAND
              </div>

              <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#fafafa', borderRadius: '10px', border: `1px solid ${credential.color}30` }}>
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>EXAM SCORE</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: credential.color }}>{generatedCertificate.exam_score || examScore?.score}%</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{examScore?.correct || 0}/{examScore?.total || 0} Correct</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>RESULT BAND</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>{credential.level}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>Practice exam</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>DATE</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#389e0d' }}>{generatedCertificate.exam_date || new Date().toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>Completed</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: `1px solid ${credential.color}30`, position: 'relative', zIndex: 1 }}>
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #666', width: '150px', margin: '0 auto 10px', height: '50px' }}></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Director</div>
                    <div style={{ fontSize: '10px', color: '#999' }}>SafeTrack Pro Global</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', border: '1px solid #ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                      <SafetyCertificateOutlined style={{ fontSize: '36px', color: credential.color }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>SafeTrack Pro Global</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #666', width: '150px', margin: '0 auto 10px', height: '50px' }}></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Practice Exam Reviewer</div>
                    <div style={{ fontSize: '10px', color: '#999' }}>SafeTrack Pro Global</div>
                  </div>
                </Col>
              </Row>

              <div style={{ marginTop: '20px', fontSize: '9px', color: '#999', textAlign: 'center', lineHeight: 1.4 }}>
                Verify this certificate of completion at {window.location.origin} (Exams &amp; Verification) with ID {generatedCertificate.certificate_id}
                <br />{PRACTICE_DISCLAIMER}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Certificate Verification Modal
  const renderVerificationModal = () => (
    <Modal
      title={<Space><VerifiedOutlined /><span>Certificate Verification</span><Tag color="green">Online check</Tag></Space>}
      open={verificationModalVisible}
      onCancel={() => { setVerificationModalVisible(false); setVerificationCode(''); setVerificationResult(null); }}
      width={600}
      footer={null}
    >
      <div style={{ padding: '20px 0' }}>
        <Alert message="Verify a certificate of completion" description="Enter the certificate ID printed on the SafeTrack Pro Global practice-exam certificate." type="info" showIcon style={{ marginBottom: 24 }} />
        <div style={{ marginBottom: 24 }}>
          <Input size="large" placeholder="Enter Certificate ID" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} prefix={<QrcodeOutlined />} onPressEnter={handleVerifyCertificate} />
        </div>
        <Button type="primary" icon={<VerifiedOutlined />} onClick={handleVerifyCertificate} loading={verifying} block size="large" style={{ marginBottom: 24 }}>Verify Certificate</Button>

        {verificationResult && (
          <Card style={{ borderColor: verificationResult.valid ? '#52c41a' : '#ff4d4f', backgroundColor: verificationResult.valid ? '#f6ffed' : '#fff2f0' }}>
            {verificationResult.valid ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={4} style={{ color: '#52c41a', marginTop: 8 }}>Genuine certificate of completion</Title>
                </div>
                <div><Text strong>Recipient:</Text><div style={{ fontSize: 16, fontWeight: 'bold' }}>{verificationResult.recipient_name}</div></div>
                <div><Text strong>Course:</Text><div>{verificationResult.course_title}</div></div>
                <Row gutter={[16, 8]}>
                  <Col span={12}><Text strong>Certificate ID:</Text><div style={{ fontFamily: 'monospace' }}>{verificationResult.certificate_id}</div></Col>
                  <Col span={12}><Text strong>Score:</Text><div><Tag color="blue">{verificationResult.exam_score}%</Tag></div></Col>
                  <Col span={12}><Text strong>Issue Date:</Text><div>{new Date(verificationResult.issue_date).toLocaleDateString()}</div></Col>
                  <Col span={12}><Text strong>Type:</Text><div>{verificationResult.certificate_type || 'Practice exam - certificate of completion'}</div></Col>
                </Row>
                <Alert type="info" showIcon style={{ marginTop: 12 }} message={verificationResult.disclaimer || PRACTICE_DISCLAIMER} />
                <Divider />
                <div style={{ textAlign: 'center' }}><Button type="link" size="small" icon={<ShareAltOutlined />} onClick={handleCopyVerificationLink}>Copy Verification Link</Button></div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                <Title level={4} style={{ color: '#ff4d4f', marginTop: 8 }}>Invalid Certificate</Title>
                <Text type="secondary">{verificationResult.message}</Text>
              </div>
            )}
          </Card>
        )}
      </div>
    </Modal>
  );

  // Always point the ref at this render's performSubmit (fresh state)
  performSubmitRef.current = performSubmit;

  // Stop the countdown once the exam has been submitted, so it can't auto-submit again
  useEffect(() => {
    if (examFlowStep === 'results' && examTimer) {
      clearInterval(examTimer);
    }
  }, [examFlowStep, examTimer]);

  // Expose "start exam" to the parent page (used by the floating button)
  useImperativeHandle(ref, () => ({
    startExam: handleStartExamFlow
  }));

  // ============= MAIN RENDER =============
  return (
    <>
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Alert message="Practice exams & certificate checks" description="Prepare for safety-professional exams with a full-length CSP-style practice exam, and check any SafeTrack certificate of completion." type="info" showIcon />
          </Col>
          <Col xs={24} lg={12}>
            {renderExamFlowCard()}
          </Col>
          <Col xs={24} lg={12}>
            {renderVerificationCard()}
          </Col>
        </Row>
      </div>

      {/* Modals */}
      {renderExamSetupModal()}
      {renderExamTakingModal()}
      {renderExamResultsModal()}
      {renderExamCertificateModal()}
      {renderVerificationModal()}
    </>
  );
});

export default AIExamCertificate;
