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

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(-1);
    };
    return (
        <div className="glass-card animate-fade-in" style={{ position: 'relative', overflow: 'hidden', height, padding: '2rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            {/* Subtle background glow */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

            {title && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: children ? '1.5rem' : '2.5rem', position: 'relative', zIndex: 1 }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        {icon && <div style={{ color: 'var(--accent-blue)', display: 'flex' }}>{icon}</div>} {title}
                    </h3>
                    {titleRightElement && titleRightElement}
                </div>
            )}
            {children && <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>{children}</div>}

            <div style={{ height: title ? 'calc(100% - 80px)' : '100%', width: '100%', position: 'relative', zIndex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx={showLegend ? "35%" : "50%"}
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
                                    scale={activeIndex === index ? 1.08 : 1}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(val: any) => [`R$ ${val?.toLocaleString('pt-BR') || '0,00'}`, 'Valor']}
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid var(--glass-border-strong)',
                                borderRadius: '18px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                                color: '#f8fafc',
                                padding: '16px 20px',
                                borderLeft: '4px solid var(--accent-blue)'
                            }}
                            itemStyle={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem', marginTop: '4px' }}
                            labelStyle={{ color: 'var(--accent-blue)', fontWeight: 900, marginBottom: '8px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Central Value Display */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: showLegend ? '35%' : '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    width: innerRadius * 1.6,
                    padding: '10px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.03)'
                }}>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '6px' }}>Total Geral</span>
                    <span style={{ display: 'block', color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-1px' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--accent-blue)', marginRight: '4px' }}>R$</span>
                        {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                    {activeIndex !== -1 && data[activeIndex] && (
                        <div className="animate-fade-in" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ display: 'block', color: colors[activeIndex % colors.length], fontSize: '0.85rem', fontWeight: 900 }}>
                                {(((data[activeIndex].value || 0) / (total || 1)) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showLegend && <CustomLegendOverlay data={data} total={total} show={showLegend} formatLabel={formatLabel} title={title.replace('Alocação por ', '').replace('Macro ', '').replace('Concentração de ', '')} colors={colors} />}
        </div>
    );
};
