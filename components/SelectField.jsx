import { Picker } from '@react-native-picker/picker';
import { View, Text } from 'react-native';

const SelectField = ({
    title,
    selectedValue,
    options,
    handleValueChange,
    otherStyles,
    ...props
}) => {
    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

            <View className="w-full h-16 px-4 rounded-2xl border-2 border-dashed border-secondary focus:border-secondary flex flex-row items-center">
                <Picker
                    selectedValue={selectedValue}
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16 }}
                    onValueChange={handleValueChange}
                    {...props}
                >
                    {options.map((option, index) => (
                        <Picker.Item key={index} label={option.label} value={option.value} />
                    ))}
                </Picker>
            </View>
        </View>
    );
};

export default SelectField;