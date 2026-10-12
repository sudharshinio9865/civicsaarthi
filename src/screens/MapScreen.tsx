import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { api } from '../services/api';
import { Complaint, PriorityLevel } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

interface Props {
  onSelectComplaint: (complaint: Complaint) => void;
  isDark: boolean;
}

const CATEGORIES = ['All', 'Roads', 'Sanitation', 'Water', 'Electricity', 'Safety'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const MapScreen: React.FC<Props> = ({ onSelectComplaint, isDark }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [activePin, setActivePin] = useState<Complaint | null>(null);

  const fetchMarkers = async () => {
    setLoading(true);
    try {
      const data = await api.getMapMarkers();
      setComplaints(data || []);
      if (data && data.length > 0) {
        setActivePin(data[0]);
      }
    } catch (err: any) {
      console.warn('Map markers error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  const filtered = complaints.filter((c) => {
    const catMatch =
      selectedCategory === 'All' ||
      (c.category && c.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const priMatch = selectedPriority === 'All' || c.priority === selectedPriority;
    return catMatch && priMatch;
  });

  const bg = isDark ? '#0b0f19' : '#f8fafc';
  const cardBg = isDark ? '#151c2c' : '#ffffff';
  const borderCol = isDark ? '#243048' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const subtextCol = isDark ? '#94a3b8' : '#64748b';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: textCol }]}>Interactive Civic GIS Map</Text>
          <View style={styles.liveTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTagText}>LIVE HOTSPOTS</Text>
          </View>
        </View>
        <Text style={[styles.screenSubtitle, { color: subtextCol }]}>
          Geospatial visualization of open municipal complaints, cluster density and hazard corridors.
        </Text>
      </View>

      {/* Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? '#0d9488' : cardBg,
                  borderColor: isSelected ? '#0f766e' : borderCol,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#ffffff' : textCol, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Priority Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {PRIORITIES.map((pri) => {
          const isSelected = selectedPriority === pri;
          return (
            <TouchableOpacity
              key={pri}
              style={[
                styles.chipSm,
                {
                  backgroundColor: isSelected ? '#6366f1' : cardBg,
                  borderColor: isSelected ? '#4f46e5' : borderCol,
                },
              ]}
              onPress={() => setSelectedPriority(pri)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipTextSm,
                  { color: isSelected ? '#ffffff' : textCol, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {pri}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Spatial Radar Map Canvas Card */}
      <View style={[styles.mapCard, { backgroundColor: isDark ? '#0f172a' : '#0f172a' }]}>
        <View style={styles.mapGridOverlay}>
          {/* Grid lines */}
          <View style={styles.gridLineH} />
          <View style={styles.gridLineV} />
          <View style={styles.radarRing} />
          <View style={styles.radarRingLg} />

          {/* Compass labels */}
          <Text style={styles.compassN}>N</Text>
          <Text style={styles.compassS}>S</Text>
          <Text style={styles.compassW}>W</Text>
          <Text style={styles.compassE}>E</Text>

          {/* Center Civic Hall Pin */}
          <View style={styles.centerPin}>
            <Text style={{ fontSize: 14 }}>🏛️</Text>
            <Text style={styles.centerLabel}>Municipal HQ</Text>
          </View>

          {/* Render Complaint Markers spatially */}
          {filtered.map((item, idx) => {
            // Compute deterministic visual offset based on lat/lng
            const baseLat = 12.97;
            const baseLng = 77.6;
            const dLat = (item.lat - baseLat) * 800;
            const dLng = (item.lng - baseLng) * 800;

            const posX = Math.max(20, Math.min(270, 140 + dLng + (idx % 3) * 20 - 20));
            const posY = Math.max(20, Math.min(220, 110 - dLat + (idx % 4) * 15 - 20));

            const isSelected = activePin?.id === item.id;
            const isCritical = item.priority === 'Critical' || item.emergency;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.markerPin,
                  { left: posX, top: posY },
                  isSelected && styles.markerPinSelected,
                ]}
                onPress={() => setActivePin(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.pinBubble,
                    {
                      backgroundColor: isCritical
                        ? '#ef4444'
                        : item.priority === 'High'
                        ? '#f97316'
                        : '#10b981',
                    },
                    isSelected && { transform: [{ scale: 1.25 }] },
                  ]}
                >
                  <Text style={styles.pinIcon}>
                    {item.category?.includes('Road')
                      ? '🚧'
                      : item.category?.includes('Water')
                      ? '💧'
                      : item.category?.includes('Sanitation')
                      ? '🗑️'
                      : item.category?.includes('Electricity')
                      ? '⚡'
                      : '⚠️'}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.pinCallout}>
                    <Text style={styles.pinCalloutText} numberOfLines={1}>
                      {item.tracking_id}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.mapFooterBar}>
          <Text style={styles.mapStatsText}>
            Showing {filtered.length} active geocoded incidents
          </Text>
          <TouchableOpacity onPress={fetchMarkers}>
            <Text style={styles.refreshMapText}>🔄 Recenter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Marker Details Bottom Sheet Card */}
      {activePin ? (
        <View style={[styles.detailCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.detailCardHeader}>
            <View>
              <Text style={styles.detailTrackingId}>{activePin.tracking_id}</Text>
              <Text style={[styles.detailTitle, { color: textCol }]} numberOfLines={1}>
                {activePin.title}
              </Text>
            </View>
            <StatusBadge status={activePin.status} />
          </View>

          <Text style={[styles.detailAddress, { color: subtextCol }]}>
            📍 {activePin.address || 'Bengaluru Municipal District'} ({activePin.lat.toFixed(4)},{' '}
            {activePin.lng.toFixed(4)})
          </Text>

          <View style={styles.detailMetricsRow}>
            <PriorityBadge priority={activePin.priority} urgency={activePin.urgency} />
            <Text style={[styles.detailDept, { color: subtextCol }]}>🏛️ {activePin.department}</Text>
          </View>

          <TouchableOpacity
            style={styles.inspectBtn}
            onPress={() => onSelectComplaint(activePin)}
            activeOpacity={0.8}
          >
            <Text style={styles.inspectBtnText}>Inspect Full Complaint & Timeline →</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Hotspots Corridor Legend */}
      <View style={[styles.hotspotLegendCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.legendTitle, { color: textCol }]}>🚨 Identified Civic Corridors</Text>
        <View style={styles.hotspotRow}>
          <View style={[styles.hotspotDot, { backgroundColor: '#ef4444' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hotspotName, { color: textCol }]}>MG Road & Brigade Junction</Text>
            <Text style={[styles.hotspotDesc, { color: subtextCol }]}>
              3 road damage reports within 200m • High skidding risk
            </Text>
          </View>
        </View>
        <View style={styles.hotspotRow}>
          <View style={[styles.hotspotDot, { backgroundColor: '#f97316' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hotspotName, { color: textCol }]}>Indiranagar 100ft Road</Text>
            <Text style={[styles.hotspotDesc, { color: subtextCol }]}>
              Streetlight electrical issues after heavy monsoon rain
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  liveTag: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  liveTagText: {
    color: '#065f46',
    fontSize: 9,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
  },
  chipSm: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  chipTextSm: {
    fontSize: 11,
  },
  mapCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 310,
    marginVertical: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  mapGridOverlay: {
    flex: 1,
    position: 'relative',
  },
  gridLineH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLineV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  radarRing: {
    position: 'absolute',
    left: '30%',
    top: '25%',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)',
  },
  radarRingLg: {
    position: 'absolute',
    left: '15%',
    top: '10%',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.15)',
  },
  compassN: { position: 'absolute', top: 6, alignSelf: 'center', color: '#64748b', fontSize: 10, fontWeight: '700' },
  compassS: { position: 'absolute', bottom: 30, alignSelf: 'center', color: '#64748b', fontSize: 10, fontWeight: '700' },
  compassW: { position: 'absolute', left: 8, top: '48%', color: '#64748b', fontSize: 10, fontWeight: '700' },
  compassE: { position: 'absolute', right: 8, top: '48%', color: '#64748b', fontSize: 10, fontWeight: '700' },
  centerPin: {
    position: 'absolute',
    top: '44%',
    left: '42%',
    alignItems: 'center',
  },
  centerLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
  },
  markerPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerPinSelected: {
    zIndex: 20,
  },
  pinBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 3,
  },
  pinIcon: {
    fontSize: 12,
  },
  pinCallout: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    elevation: 3,
  },
  pinCalloutText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  mapFooterBar: {
    height: 32,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  mapStatsText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  refreshMapText: {
    color: '#14b8a6',
    fontSize: 10,
    fontWeight: '700',
  },
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  detailTrackingId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d9488',
    marginBottom: 2,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 220,
  },
  detailAddress: {
    fontSize: 12,
    marginBottom: 10,
  },
  detailMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailDept: {
    fontSize: 11,
  },
  inspectBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  inspectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  hotspotLegendCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  hotspotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hotspotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  hotspotName: {
    fontSize: 12,
    fontWeight: '700',
  },
  hotspotDesc: {
    fontSize: 11,
    marginTop: 1,
  },
});
