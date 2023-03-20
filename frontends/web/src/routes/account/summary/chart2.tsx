/**
 * Copyright 2020 Shift Crypto AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-nocheck

import { useState, ReactChild, useRef, useEffect } from 'react';
import i18n from '../../../i18n/i18n';
import { createChart, IChartApi, BarsInfo, LineData, LineStyle, LogicalRange, ISeriesApi, UTCTimestamp, MouseEventHandler, MouseEventParams, BarPrice } from 'lightweight-charts';
import { ISummary } from '../../../api/account';
import { Skeleton } from '../../../components/skeleton/skeleton';
import { formatNumber } from '../../../components/rates/rates';
import { bitcoinRemoveTrailingZeroes } from '../../../utils/trailing-zeroes';
import styles from './chart.module.css';
import Filters from './filters';
import { getDarkmode } from '../../../components/darkmode/darkmode';
import { TChartDisplay, TChartFiltersProps } from './types';
import { ArrowDown, ArrowUp } from './chart';
import { useTranslation } from 'react-i18next';
import { usePrevious } from '../../../hooks/prevprops';

export type FormattedLineData = { formattedValue: string; } & LineData;

export type ChartData = FormattedLineData[];

type TChartProps = {
    data: ISummary;
    noDataPlaceholder?: ReactChild;
};

type FormattedData = {
  [key: number]: string;
}

export const Chart2 = ({ data, noDataPlaceholder }: TChartProps) => {
  const [display, setDisplay] = useState<TChartDisplay>('all');
  const [source, setSource] = useState<'daily' | 'hourly'>('daily');
  const [difference, setDifference] = useState<number>();
  const [diffSince, setDiffSince] = useState<string>();
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [toolTipValue, setToolTipValue] = useState<string>();
  const [toolTipTop, setToolTipTop] = useState(0);
  const [toolTipLeft, setToolTipLeft] = useState(0);
  const [toolTipTime, setToolTipTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [chartState, setChartState] = useState<IChartApi>();
  const [lineSeriesState, setLineSeriesState] = useState<ISeriesApi<'Area'>>();
  const [formattedDataState, setFormattedDataState] = useState<FormattedData>();

  const { t } = useTranslation();

  const divRef = useRef<HTMLDivElement>(null);
  const refToolTip = useRef<HTMLSpanElement>(null);

  let resizeTimerID: any;
  const height = 300;
  const mobileHeight = 150;

  const { chartDataDaily, chartDataMissing, chartFiat, chartIsUpToDate, chartTotal, formattedChartTotal, chartDataHourly } = data;

  const prev = usePrevious({ chartDataDaily, chartDataHourly });

  useEffect(() => {
    checkIfMobile();
    createChartLocal();
    return () => {
      window.removeEventListener('resize', onResize);
      if (chartState) {
        chartState.timeScale().unsubscribeVisibleLogicalRangeChange(calculateChange);
        chartState.unsubscribeCrosshairMove(handleCrosshair as MouseEventHandler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    if (chartState) {
      chartState.timeScale().subscribeVisibleLogicalRangeChange(() => {
        calculateChange(source);
      });
    }

  }, [source, chartState]);

  useEffect(() => {
    if (formattedDataState && toolTipTime) {
      setToolTipValue(formattedDataState ? formattedDataState[toolTipTime as number] : undefined);
    }
  }, [formattedDataState, toolTipTime]);

  useEffect(() => {
    const darkmode = getDarkmode();
    if (chartState) {
      const lineSeries = chartState.addAreaSeries({
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: 'volume',
        },
        topColor: darkmode ? '#5E94BF' : '#DFF1FF',
        bottomColor: darkmode ? '#1D1D1B' : '#F5F5F5',
        lineColor: 'rgba(94, 148, 192, 1)',
        crosshairMarkerRadius: 6,
      });
      setLineSeriesState(lineSeries);
      setFormattedData(data.chartDataDaily as ChartData);
      chartState.timeScale().fitContent();
      window.addEventListener('resize', onResize);
      setTimeout(() => divRef.current?.classList.remove(styles.invisible), 200);
    }
  }, [chartState]);

  useEffect(() => {
    if (lineSeriesState && chartState) {
      lineSeriesState.setData(data.chartDataDaily as ChartData);
      chartState.subscribeCrosshairMove(handleCrosshair as MouseEventHandler);
      chartState.timeScale().subscribeVisibleLogicalRangeChange(() => {
        calculateChange(source);
      });
    }
  }, [lineSeriesState, chartState, data.chartDataDaily]);

  useEffect(() => {
    //displayWeek
    if (display === 'week' && source === 'hourly') {
      if (!chartState) {
        return;
      }
      const { utcDate, from, to } = getUTCRange();
      from.setUTCDate(utcDate - 7);
      chartState.timeScale().setVisibleRange({
        from: from.getTime() / 1000 as UTCTimestamp,
        to: to.getTime() / 1000 as UTCTimestamp,
      });
      return;
    }

    //displayMonth
    if (display === 'month' && source === 'daily') {
      if (!chartState) {
        return;
      }
      const { utcMonth, from, to } = getUTCRange();
      from.setUTCMonth(utcMonth - 1);
      chartState.timeScale().setVisibleRange({
        from: from.getTime() / 1000 as UTCTimestamp,
        to: to.getTime() / 1000 as UTCTimestamp,
      });

      return;
    }

    //displayYear
    if (display === 'year' && source === 'daily') {
      if (!chartState) {
        return;
      }
      const { utcYear, from, to } = getUTCRange();
      from.setUTCFullYear(utcYear - 1);
      chartState && chartState.timeScale().setVisibleRange({
        from: from.getTime() / 1000 as UTCTimestamp,
        to: to.getTime() / 1000 as UTCTimestamp,
      });

      return;
    }

    //displayAll
    if (display === 'all' && source === 'daily') {
      if (!chartState) {
        return;
      }
      chartState.timeScale().fitContent();


    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, source, chartState]);

  const hasData = (): boolean => {
    return data.chartDataDaily && data.chartDataDaily.length > 0;
  };

  const setFormattedData = (data: ChartData) => {
    const formattedData = {} as FormattedData;
    data.forEach(entry => {
      if (formattedData) {
        formattedData[entry.time as number] = entry.formattedValue;
      }
    });
    setFormattedDataState(formattedData);
  };

  const checkIfMobile = () => {
    setIsMobile(window.innerWidth <= 640);
  };

  const onResize = () => {
    checkIfMobile();
    if (resizeTimerID) {
      clearTimeout(resizeTimerID);
    }
    resizeTimerID = setTimeout(() => {
      if (!chartState || !divRef.current) {
        return;
      }
      const chartWidth = !isMobile ? divRef.current.offsetWidth : 100;
      const chartHeight = !isMobile ? height : mobileHeight;
      chartState.resize(chartWidth, chartHeight);
      chartState.applyOptions({
        grid: {
          horzLines: {
            visible: !isMobile
          }
        },
        timeScale: {
          visible: !isMobile
        },
        leftPriceScale: {
          visible: !isMobile
        },
      });
    }, 200);
  };

  const getUTCRange = () => {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();
    const utcHours = now.getUTCHours();
    const to = new Date(Date.UTC(utcYear, utcMonth, utcDate, utcHours, 0, 0, 0));
    const from = new Date(Date.UTC(utcYear, utcMonth, utcDate, utcHours, 0, 0, 0));
    return {
      utcYear,
      utcMonth,
      utcDate,
      to,
      from,
    };
  };

  const displayWeek = () => {
    if (source !== 'hourly' && lineSeriesState && data.chartDataHourly && chartState) {
      lineSeriesState.setData(data.chartDataHourly || []);
      setFormattedData(data.chartDataHourly || []);
      chartState.applyOptions({ timeScale: { timeVisible: true } });
    }
    setDisplay('week');
    setSource('hourly');
  };

  const displayMonth = () => {
    if (source !== 'daily' && lineSeriesState && data.chartDataDaily && chartState) {
      lineSeriesState.setData(data.chartDataDaily || []);
      setFormattedData(data.chartDataDaily || []);
      chartState.applyOptions({ timeScale: { timeVisible: false } });
    }
    setDisplay('month');
    setSource('daily');
  };

  const displayYear = () => {
    if (source !== 'daily' && lineSeriesState && data.chartDataDaily && chartState) {
      lineSeriesState.setData(data.chartDataDaily);
      setFormattedData(data.chartDataDaily);
      chartState.applyOptions({ timeScale: { timeVisible: false } });
    }
    setDisplay('year');
    setSource('daily');
  };

  const displayAll = () => {
    if (source !== 'daily' && lineSeriesState && data.chartDataDaily && chartState) {
      lineSeriesState.setData(data.chartDataDaily);
      setFormattedData(data.chartDataDaily);
      chartState.applyOptions({ timeScale: { timeVisible: false } });
    }
    setDisplay('all');
    setSource('daily');
  };

  const createChartLocal = () => {
    const { chartIsUpToDate, chartDataMissing } = data;
    const darkmode = getDarkmode();
    if (divRef.current && hasData() && (chartIsUpToDate && !chartDataMissing)) {
      if (!chartState) {
        const chartWidth = !isMobile ? divRef.current.offsetWidth : document.body.clientWidth;
        const chartHeight = !isMobile ? height : mobileHeight;
        const chart = createChart(divRef.current, {
          width: chartWidth,
          height: chartHeight,
          handleScroll: false,
          handleScale: false,
          crosshair: {
            vertLine: {
              visible: false,
              labelVisible: false,
            },
            horzLine: {
              visible: false,
              labelVisible: false,
            },
            mode: 1,
          },
          grid: {
            vertLines: {
              visible: false,
            },
            horzLines: {
              color: darkmode ? '#333333' : '#dedede',
              style: LineStyle.Solid,
              visible: !isMobile,
            },
          },
          layout: {
            backgroundColor: darkmode ? '#1D1D1B' : '#F5F5F5',
            fontSize: 11,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Roboto", "Oxygen", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
            textColor: darkmode ? '#F5F5F5' : '#1D1D1B',
          },
          leftPriceScale: {
            borderVisible: false,
            drawTicks: false,
            visible: !isMobile,
            entireTextOnly: true,
          },
          localization: {
            locale: i18n.language
          },
          rightPriceScale: {
            visible: false,
            drawTicks: false,
          },
          timeScale: {
            borderVisible: false,
            timeVisible: false,
            visible: !isMobile
          },
          trackingMode: {
            exitMode: 0
          }
        });
        setChartState(chart);
      }
    }
  };

  const calculateChange = (source: string) => {
    const sourceData = data[source === 'daily' ? 'chartDataDaily' : 'chartDataHourly'];
    if (!sourceData || !chartState || !lineSeriesState) {
      return;
    }
    const logicalrange = chartState.timeScale().getVisibleLogicalRange() as LogicalRange;
    const visiblerange = lineSeriesState.barsInLogicalRange(logicalrange) as BarsInfo;
    if (!visiblerange) {
      // if the chart is empty, during first load, barsInLogicalRange is null
      return;
    }
    const rangeFrom = Math.max(Math.floor(visiblerange.barsBefore), 0);
    if (!sourceData[rangeFrom]) {
      // when data series have changed it triggers subscribeVisibleLogicalRangeChange
      // but at this point the setVisibleRange has not executed what the new range
      // should be and therefore barsBefore might still point to the old range
      // so we have to ignore this call and expect setVisibleRange with correct range
      setDifference(0);
      setDiffSince('');
      return;
    }
    const valueFrom = sourceData[rangeFrom].value;
    const valueTo = data.chartTotal;
    const valueDiff = valueTo ? valueTo - valueFrom : 0;
    setDifference((valueDiff / valueFrom) * 100);
    setDiffSince(`${sourceData[rangeFrom].formattedValue} (${renderDate(Number(sourceData[rangeFrom].time) * 1000)})`);
  };

  const handleCrosshair = ({ point, time, seriesPrices }: MouseEventParams) => {
    if (!refToolTip.current) {
      return;
    }
    const tooltip = refToolTip.current;
    const parent = tooltip.parentNode as HTMLDivElement;
    if (
      !lineSeriesState || !point || !time
            || point.x < 0 || point.x > parent.clientWidth
            || point.y < 0 || point.y > parent.clientHeight
    ) {
      setToolTipVisible(false);
      return;
    }
    const price = seriesPrices.get(lineSeriesState) as BarPrice;
    const coordinate = lineSeriesState.priceToCoordinate(price);
    if (!coordinate) {
      return;
    }
    const toolTipTop = Math.max(coordinate - 70, 0);
    const toolTipLeft = Math.max(40, Math.min(parent.clientWidth - 140, point.x + 40 - 70));
    setToolTipVisible(true);
    setToolTipTop(toolTipTop);
    setToolTipLeft(toolTipLeft);
    setToolTipTime(time as number);
  };

  const renderDate = (date: number) => {
    return new Date(date).toLocaleString(
      i18n.language,
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(source === 'hourly' ? {
          hour: '2-digit',
          minute: '2-digit',
        } : null)
      }
    );
  };

  const hasDifferenece = difference && Number.isFinite(difference);
  const hasChartData = hasData();
  const disableFilters = !hasChartData || chartTotal === 0 || chartDataMissing;
  const showMobileTotalValue = toolTipVisible && !!toolTipValue && isMobile;
  const chartFiltersProps = {
    display,
    disableFilters,
    onDisplayWeek: displayWeek,
    onDisplayMonth: displayMonth,
    onDisplayYear: displayYear,
    onDisplayAll: displayAll,
  } as TChartFiltersProps;
  const chartHeight = `${!isMobile ? height : mobileHeight}px`;

  return (
    <section className={styles.chart}>
      <header>
        <div className={styles.summary}>
          <div className={styles.totalValue}>
            {formattedChartTotal !== null ? (
            // remove trailing zeroes for BTC fiat total
              bitcoinRemoveTrailingZeroes(!showMobileTotalValue ? formattedChartTotal : toolTipValue, chartFiat)
            ) : (
              <Skeleton minWidth="220px" />
            )}
            <span className={styles.totalUnit}>
              {chartTotal !== null && chartFiat}
            </span>
          </div>
          {!showMobileTotalValue ?
            <span className={!hasDifferenece ? '' : (
              styles[difference < 0 ? 'down' : 'up']
            )} title={diffSince}>
              {hasDifferenece ? (
                <>
                  <span className={styles.arrow}>
                    {(difference < 0) ? (<ArrowUp />) : (<ArrowDown />)}
                  </span>
                  <span className={styles.diffValue}>
                    {formatNumber(difference, 2)}
                    <span className={styles.diffUnit}>%</span>
                  </span>
                </>
              ) : chartTotal === 0 ? null : (<Skeleton fontSize="1.125rem" minWidth="125px" />)}
            </span>
            :
            <span className={styles.diffValue}>
              {renderDate(toolTipTime * 1000)}
            </span>
          }
        </div>
        {!isMobile && <Filters {...chartFiltersProps} />}
      </header>
      <div className={styles.chartCanvas} style={{ minHeight: chartHeight }}>
        {(!chartIsUpToDate || chartDataMissing) ? (
          <div className={styles.chartUpdatingMessage} style={{ height: chartHeight }}>
            {chartDataDaily === undefined
              ? t('chart.dataMissing')
              : t('chart.dataUpdating')}
          </div>
        ) : hasChartData ? null : noDataPlaceholder}
        <div ref={divRef} className={styles.invisible}></div>
        <span
          ref={refToolTip}
          className={styles.tooltip}
          style={{ 'left': toolTipLeft, top: toolTipTop }}
          hidden={!toolTipVisible || isMobile}>
          {toolTipValue !== undefined ? (
            <span>
              <h2 className={styles.toolTipValue}>
                {toolTipValue}
                <span className={styles.toolTipUnit}>{chartFiat}</span>
              </h2>
              <span className={styles.toolTipTime}>
                {renderDate(toolTipTime * 1000)}
              </span>
            </span>
          ) : <p>asd</p>}
        </span>
      </div>
      {isMobile && <Filters {...chartFiltersProps} />}
    </section>
  );
};