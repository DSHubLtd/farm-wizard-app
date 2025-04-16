import { useEffect } from "react";
import { router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Settings, Trophy, Star, LogOut } from 'lucide-react-native';

import { icons } from "../../constants";
import { useLoginContext } from "../../context/LoginProvider";


export default function Profile() {
  const { user, setUser, setIsLogged } = useLoginContext();

  const logout = async () => {
    // await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };

  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    }
  }, [])
  return (
    <View className="bg-primary h-[100vh] p-4">

      <View className="w-full flex justify-center items-center px-4">
        <TouchableOpacity
          onPress={logout}
          className="flex w-full items-end"
        >
          <Image
            source={icons.logout}
            resizeMode="contain"
            className="w-6 h-6"
          />
        </TouchableOpacity>

      </View>

      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>John Doe</Text>
          <Text style={styles.farmLevel}>Master Farmer - Level 10</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Crops Grown</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3,250</Text>
          <Text style={styles.statLabel}>Coins Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Rewards Claimed</Text>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsList}>
          {[
            { icon: Trophy, title: 'First Harvest', description: 'Harvested your first magical crop' },
            { icon: Star, title: 'Green Thumb', description: 'Grew 50 crops successfully' },
          ].map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <achievement.icon size={24} color="#FFD700" />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button}>
          <Settings size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutButton]}>
          <LogOut size={20} color="#EF4444" />
          <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  username: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    marginTop: 15,
  },
  farmLevel: {
    fontSize: 16,
    color: '#E5E7EB',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,

    borderRadius: 15,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    color: '#E5E7EB',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 5,
    textAlign: 'center',
  },
  achievementsSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    marginBottom: 15,
  },
  achievementsList: {
    gap: 15,
  },
  achievementCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementInfo: {
    marginLeft: 15,
    flex: 1,
  },
  achievementTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  achievementDescription: {
    color: '#E5E7EB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  buttonsContainer: {
    marginTop: 30,
    gap: 15,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  logoutText: {
    color: '#EF4444',
  },
});