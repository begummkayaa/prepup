import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 25,
          height: 85,
          borderRadius: 30, // Kenarları görseldeki gibi oval yapar
          backgroundColor: '#0F172A', // Koyu arka plan
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          paddingBottom: 25, // Yazıları yukarı taşımak ve boşluk bırakmak için
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase', // Görseldeki gibi büyük harf görünümü için
          marginTop: 5,
        },
        // AKTİF VE PASİF RENK AYARLARI
        tabBarActiveTintColor: '#C4B5FD', // İkon ve yazı aktifken açık mor/lila
        tabBarInactiveTintColor: '#64748B', // Pasifken gri tonu
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ANA SAYFA',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'GEÇMİŞİM',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "time" : "time-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFİL',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "person" : "person-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}