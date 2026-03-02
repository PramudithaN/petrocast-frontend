import { useEffect, useState } from 'react';
import { Card, Progress, Tag, Statistic, Row, Col, Typography } from 'antd';
import { 
  ThunderboltOutlined, 
  DashboardOutlined,
  ClockCircleOutlined,
  RocketOutlined 
} from '@ant-design/icons';
import { performanceMonitor, type PerformanceMetrics } from '../utils/performance';

const { Title, Text } = Typography;

interface MetricCardProps {
  title: string;
  value: number | undefined;
  unit: string;
  goodThreshold: number;
  poorThreshold: number;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, unit, goodThreshold, poorThreshold, icon }: MetricCardProps) => {
  if (value === undefined) return null;

  const getRating = () => {
    if (value <= goodThreshold) return { color: 'success' as const, status: 'Good' };
    if (value <= poorThreshold) return { color: 'warning' as const, status: 'Needs Improvement' };
    return { color: 'error' as const, status: 'Poor' };
  };

  const rating = getRating();
  const percent = Math.min((value / poorThreshold) * 100, 100);
  
  const getValueColor = () => {
    if (rating.color === 'success') return '#52c41a';
    if (rating.color === 'warning') return '#faad14';
    return '#ff4d4f';
  };
  
  const getProgressStatus = () => {
    if (rating.color === 'success') return 'success' as const;
    if (rating.color === 'warning') return 'normal' as const;
    return 'exception' as const;
  };

  return (
    <Card 
      hoverable
      className="metric-card"
      style={{ height: '100%' }}
    >
      <Statistic
        title={
          <span>
            {icon} {title}
          </span>
        }
        value={value.toFixed(2)}
        suffix={unit}
        valueStyle={{ color: getValueColor() }}
      />
      <Progress 
        percent={percent} 
        status={getProgressStatus()}
        showInfo={false}
        style={{ marginTop: 8 }}
      />
      <Tag color={rating.color} style={{ marginTop: 8 }}>
        {rating.status}
      </Tag>
    </Card>
  );
};

export default function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for metrics to be collected
    setTimeout(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
      setIsLoading(false);
    }, 2000);

    // Update metrics periodically
    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card loading={true}>
        <p>Collecting performance metrics...</p>
      </Card>
    );
  }

  return (
    <div className="performance-monitor" style={{ padding: '24px' }}>
      <Title level={2}>
        <DashboardOutlined /> Performance Monitor
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Real-time Core Web Vitals and performance metrics
      </Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="LCP (Largest Contentful Paint)"
            value={metrics.LCP}
            unit="ms"
            goodThreshold={2500}
            poorThreshold={4000}
            icon={<RocketOutlined />}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="FID (First Input Delay)"
            value={metrics.FID}
            unit="ms"
            goodThreshold={100}
            poorThreshold={300}
            icon={<ThunderboltOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="CLS (Cumulative Layout Shift)"
            value={metrics.CLS}
            unit=""
            goodThreshold={0.1}
            poorThreshold={0.25}
            icon={<DashboardOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="TTFB (Time to First Byte)"
            value={metrics.TTFB}
            unit="ms"
            goodThreshold={800}
            poorThreshold={1800}
            icon={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="Page Load Metrics">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Load Time"
              value={metrics.loadTime || 0}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="DOM Content Loaded"
              value={metrics.domContentLoaded || 0}
              suffix="ms"
              prefix={<DashboardOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="First Contentful Paint"
              value={metrics.FCP || 0}
              suffix="ms"
              prefix={<RocketOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 24 }} title="Performance Tips">
        <ul style={{ marginBottom: 0 }}>
          <li>LCP should be under 2.5s for good user experience</li>
          <li>FID should be under 100ms for responsive interactions</li>
          <li>CLS should be under 0.1 to prevent layout shifts</li>
          <li>TTFB should be under 800ms for fast server response</li>
        </ul>
      </Card>
    </div>
  );
}
