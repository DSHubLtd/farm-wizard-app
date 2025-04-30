import { ArrowDown, ArrowUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const SelectField = ({ title, options, selectedValue, handleValueChange, otherStyles }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown visibility

    const handleSearch = (text) => {
        setSearchText(text);
        setFilteredOptions(options.filter(option =>
            option.label.toLowerCase().includes(text.toLowerCase())
        ));
    };

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

            {/* Dropdown Box */}
            <TouchableOpacity
                onPress={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-dotted border-secondary flex-row justify-between items-center"
            >
                {/* <Image source={{ uri: item.flag }} className="w-6 h-4 mr-2 rounded" /> */}
                <Text className="text-white font-psemibold text-base">
                    {selectedValue ? options.find(opt => opt.value === selectedValue)?.label : "Select an option"}
                </Text>
                {/* <FontAwesome name={dropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#fff" /> */}
                {dropdownOpen ? (<ArrowUp size={35} color="#ffffff" />) : (<ArrowDown size={35} color="#ffffff" />)}

            </TouchableOpacity>

            {/* Dropdown List - Visible Only When Open */}
            {dropdownOpen && (
                <View className="w-full bg-gray-800 p-2 rounded-lg mt-2">
                    <TextInput
                        className="w-full text-white font-psemibold text-base mb-2"
                        placeholder="Search..."
                        placeholderTextColor="#7B7B8B"
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                    <ScrollView className="max-h-[200px]">
                        {filteredOptions.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                onPress={() => {
                                    handleValueChange(item.value);
                                    setSearchText(item.label);
                                    setDropdownOpen(false);
                                }}
                                className="py-2 px-4 bg-gray-700 rounded-lg mb-2"
                            >
                                <Text className="text-white font-psemibold">{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* <FlatList
                        data={filteredOptions}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    handleValueChange(item.value);
                                    setSearchText(item.label); // Update display text
                                    setDropdownOpen(false); // Close dropdown after selection
                                }}
                                className="py-2 px-4 bg-gray-700 rounded-lg mb-2"
                            >
                                <Text className="text-white font-psemibold">{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    /> */}
                </View>
            )}
        </View>
    );
};

export default SelectField;
// import { Picker } from '@react-native-picker/picker';
// import { View, Text } from 'react-native';

// const SelectField = ({
//     title,
//     selectedValue,
//     options,
//     handleValueChange,
//     otherStyles,
//     ...props
// }) => {
//     return (
//         <View className={`space-y-2 ${otherStyles}`}>
//             <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

//             <View className="w-full h-16 px-4 rounded-2xl border-2 border-dotted border-secondary focus:border-secondary flex flex-row items-center">
//                 <Picker
//                     selectedValue={selectedValue}
//                     style={{ flex: 1, color: '#FFFFFF', fontSize: 16 }}
//                     onValueChange={handleValueChange}
//                     {...props}
//                 >
//                     {options.map((option, index) => (
//                         <Picker.Item key={index} label={option.label} value={option.value} />
//                     ))}
//                 </Picker>
//             </View>
//         </View>
//     );
// };

// export default SelectField;