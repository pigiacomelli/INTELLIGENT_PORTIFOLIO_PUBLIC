import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomLegendOverlay } from '../utils/dashboardUtils';

interface ChartDataItem {
    name: string;
    value: number;
    [key: string]: any;
}

interface AssetAllocationChartProps {
    title: string;
    icon?: React.ReactNode;
    data: ChartDataItem[];
    total: number;
    showLegend: boolean;
    colors: string[];
    formatLabel?: (label: string) => string;
    height?: string;
    innerRadius?: number;
    outerRadius?: number;
    titleRightElement?: React.ReactNode;
    children?: React.ReactNode;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
    title, icon, data, total, showLegend, colors, formatLabel,
    height = '450px', innerRadius = 85, outerRadius = 120, titleRightElement, children
}) => {
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const compactTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(total || 0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(-1);
    };
    return (
        <section className="glass-card allocation-chart animate-fade-in" style={{ minHeight: height }}>
            {/* Subtle background glow */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

            {title && (
                <div className="allocation-chart__header" style={{ marginBottom: children ? '1rem' : undefined }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        {icon && <div style={{ color: 'var(--accent-blue)', display: 'flex' }}>{icon}</div>} {title}
                    </h3>
                    {titleRightElement && titleRightElement}
                </div>
            )}
            {children && <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>{children}</div>}

            <div className={`allocation-chart__body${showLegend ? ' has-legend' : ''}`}>
                <div className="allocation-chart__plot">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                paddingAngle={5}
                                dataKey="value"
                                animationDuration={1200}
                                animationBegin={200}
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                        style={{
                                            outline: 'none',
                                            filter: activeIndex === index ? `drop-shadow(0 0 15px ${colors[index % colors.length]}88)` : 'none',
                                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer'
                                        }}
                                        scale={activeIndex === index ? 1.06 : 1}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(val: any) => [(Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }), 'Valor']}
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--glass-border-strong)',
                                    borderRadius: '14px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                                    color: '#f8fafc',
                                    padding: '12px 14px',
                                    borderLeft: '4px solid var(--accent-blue)'
                                }}
                                itemStyle={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}
                                labelStyle={{ color: 'var(--accent-blue)', fontWeight: 900, marginBottom: '6px', fontSize: '0.9rem', textTransform: 'uppercase' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="allocation-chart__center" aria-label={`Total geral: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                        <span>Total geral</span>
                        <strong>{compactTotal}</strong>
                        {activeIndex !== -1 && data[activeIndex] && (
                            <small className="animate-fade-in" style={{ color: colors[activeIndex % colors.length] }}>
                                {(((data[activeIndex].value || 0) / (total || 1)) * 100).toFixed(1)}%
                            </small>
                        )}
                    </div>
                </div>

                {showLegend && <CustomLegendOverlay data={data} total={total} show={showLegend} formatLabel={formatLabel} title={title.replace('Alocação por ', '').replace('Macro ', '').replace('Concentração de ', '') || 'Composição'} colors={colors} />}
            </div>
        </section>
    );
};
