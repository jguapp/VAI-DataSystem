import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import surveyQuestions from "../data/surveyQuestions";
import "../styles/dashboard.css";
import "../styles/global.css";
import Navbar from "../components/Navbar";
import { useAuth } from '../utils/AuthContext';
import API from '../utils/apiClient';

Chart.register(ChartDataLabels);

const SCALE_IDS = new Set(['q8', 'q9', 'q10', 'q11']);

const aggregateResponses = (data, questionId) => {
  const counts = {};
  data.forEach(entry => {
    const responses = entry.responses;
    if (!responses || typeof responses !== "object") return;
    const response = responses[questionId];
    if (response) {
      const values = Array.isArray(response) ? response : [response];
      values.forEach(val => {
        counts[val] = (counts[val] || 0) + 1;
      });
    }
  });
  return counts;
};

const averageScore = (data, questionId) => {
  const values = [];
  data.forEach(entry => {
    const response = entry.responses?.[questionId];
    const val = parseFloat(Array.isArray(response) ? response[0] : response);
    if (!isNaN(val)) values.push(val);
  });
  if (values.length === 0) return null;
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
};

const handleDownload = async () => {
  try {
    const response = await API.get('/generate-report', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'survey_reports.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error downloading the report:', err);
  }
};

export default function Dashboard() {
  const { surveyData } = useAuth();
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [installationFilter, setInstallationFilter] = useState("all");
  const [chartType, setChartType] = useState("pie");

  const chartRefs = useRef({});
  const charts = useRef({});

  const filteredData = installationFilter === "all"
    ? surveyData
    : surveyData.filter(entry => entry.installationId === installationFilter);

  const cgCount = surveyData.filter(e => e.installationId === 'common-ground').length;
  const bpCount = surveyData.filter(e => e.installationId === 'breathing-pavilion').length;

  const choiceQuestions = surveyQuestions.filter(q => !SCALE_IDS.has(q.questionId));
  const scaleQuestions  = surveyQuestions.filter(q =>  SCALE_IDS.has(q.questionId));

  useEffect(() => {
    setLoadingCharts(true);

    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      setLoadingCharts(false);
      return;
    }

    choiceQuestions.forEach(({ questionId }) => {
      const canvas = chartRefs.current[questionId];
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const data = aggregateResponses(filteredData, questionId);
      if (charts.current[questionId]) charts.current[questionId].destroy();

      charts.current[questionId] = new Chart(ctx, {
        type: chartType,
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: [
              "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
              "#FF9F40", "#E7E9ED", "#76A21E", "#C71F37", "#00A6B4"
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              formatter: (value, context) => {
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                return `${((value / total) * 100).toFixed(1)}%`;
              },
              color: "#000",
              font: { weight: "bold", size: 13 }
            },
            legend: { position: "bottom" }
          }
        }
      });
    });

    // Scale questions: always a bar chart showing distribution 1–5
    scaleQuestions.forEach(({ questionId }) => {
      const canvas = chartRefs.current[questionId];
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const raw = aggregateResponses(filteredData, questionId);
      const labels = ['1', '2', '3', '4', '5'];
      const values = labels.map(l => raw[l] || 0);

      if (charts.current[questionId]) charts.current[questionId].destroy();

      charts.current[questionId] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: "#36C0FC",
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: { display: false },
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    });

    setLoadingCharts(false);
  }, [filteredData, chartType]);

  return (
    <>
      <Navbar />

      {/* Summary stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-number">{surveyData.length}</span>
          <span className="stat-label">Total Responses</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{cgCount}</span>
          <span className="stat-label">Common Ground</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{bpCount}</span>
          <span className="stat-label">Breathing Pavilion</span>
        </div>
      </div>

      <div className="dashboard-controls">
        <label htmlFor="chart-type">Chart Type:</label>
        <select id="chart-type" value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="pie">Pie</option>
          <option value="doughnut">Doughnut</option>
          <option value="bar">Bar</option>
        </select>

        <label htmlFor="installationFilter">Installation:</label>
        <select id="installationFilter" value={installationFilter} onChange={(e) => setInstallationFilter(e.target.value)}>
          <option value="all">All Installations ({surveyData.length} responses)</option>
          <option value="common-ground">Common Ground ({cgCount})</option>
          <option value="breathing-pavilion">Breathing Pavilion ({bpCount})</option>
        </select>
      </div>

      {loadingCharts ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : filteredData.length === 0 ? (
        <div className="dashboard-container">
          <p>No survey responses yet{installationFilter !== 'all' ? ' for this installation' : ''}.</p>
        </div>
      ) : (
        <>
          <div className="charts-container">
            {choiceQuestions.map(({ questionId, question }) => (
              <div key={questionId} className="chart-block">
                <h3>{question}</h3>
                <canvas ref={(el) => (chartRefs.current[questionId] = el)} />
              </div>
            ))}
          </div>

          <h2 className="scale-section-heading">Experience Ratings (1–5)</h2>
          <div className="charts-container">
            {scaleQuestions.map(({ questionId, question }) => {
              const avg = averageScore(filteredData, questionId);
              return (
                <div key={questionId} className="chart-block">
                  <h3>{question}</h3>
                  {avg && <p className="avg-score">Average: <strong>{avg} / 5</strong></p>}
                  <canvas ref={(el) => (chartRefs.current[questionId] = el)} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', margin: '2rem' }}>
        <button className="blue-button" onClick={handleDownload}>Download Report</button>
      </div>
    </>
  );
}
