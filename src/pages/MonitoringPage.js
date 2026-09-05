import React, { useState } from "react";
import { Tabs, Card } from "antd";
import MoStationList from "../components/monitoring/EnvironmentalDashboard";
import MoStationForm from "../components/monitoring/AirQualitySensorCard";
import MoAnalysis from "../components/monitoring/EnvironmentalDashboard";
import MonitoringAlert from "../components/monitoring/MonitoringAlerts";
import MoRead from "../components/monitoring/EnvironmentalDashboard";
import WaterQualityPanel from "../components/monitoring/WaterQualityPanel";
import AQIMeter from "../components/monitoring/AQIMeter";

export default function MonitoringPage({ hospitalId }) {
  const [selectedStation, setSelectedStation] = useState(null);

  return (
    <Card>
      <Tabs defaultActiveKey="stations">
        <Tabs.TabPane tab="Environmental Stations" key="stations">
          <MoStationList hospitalId={hospitalId} onSelect={setSelectedStation} />
          <div style={{ marginTop: 24 }}>
            <MoStationForm hospitalId={hospitalId} onCreated={() => window.location.reload()} />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Air Quality" key="air">
          <MoAnalysis hospitalId={hospitalId} />
          <AQIMeter hospitalId={hospitalId} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Water Quality" key="water">
          <WaterQualityPanel hospitalId={hospitalId} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Alerts" key="alerts" disabled={!selectedStation}>
          {selectedStation && <MonitoringAlert stationId={selectedStation} />}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Sensor Readings" key="readings" disabled={!selectedStation}>
          {selectedStation && <MoRead stationId={selectedStation} />}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}