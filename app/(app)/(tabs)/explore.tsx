import { StyleSheet} from 'react-native';
import CustomScrollView from '@/components/CustomScrollView';

export default function TabTwoScreen() {
  return (
    <CustomScrollView></CustomScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
