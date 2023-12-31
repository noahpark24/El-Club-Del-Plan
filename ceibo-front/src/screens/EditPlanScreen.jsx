import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import LoginScreen from "./LoginScreen";
import ChevronImg from "../assets/images/chevron.png";
import { AntDesign, EvilIcons, Feather } from "@expo/vector-icons";
// Components
import { styles } from "../styles/editPlanStyles";
import { ChangeData } from "../components/ChangeData";
import { Navbar } from "../components/Navbar";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { getCategories } from "../services/getCategories";
import ModalSelector from "react-native-modal-selector";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { CheckBox } from "react-native-elements";
import axios from "axios";
import { API_URL } from "../services/urls";
import refetchData from "../services/refetchData";
import { removePlan } from "../state/plans";
import { ProfileText } from "../components/ProfileText";

export default function EditPlanScreen() {
  const plan = useSelector((state) => state.selectedPlan);
  const navigation = useNavigation();

  const [category, setCategory] = useState(plan?.category?.name);
  const [imageUrl, setImageUrl] = useState(plan?.img);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState(plan?.private);

  const handleCheckBoxToggle = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await axios.put(
          `${API_URL}/api/events/${plan._id}`,
          {
            private: !checked,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setChecked(!checked);
        removePlan(plan._id);
      }
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(
        data.map((item, index) => ({ key: index, label: item.name }))
      );
    });
  }, []);

  const selectImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      const token = await AsyncStorage.getItem("token");
      const path = result?.assets[0]?.uri;
      if (token && path) {
        if (path !== "") {
          const formData = new FormData();
          formData.append("image", {
            uri: path,
            type: "image/jpeg",
            name: "image.jpg",
          });
          const res = await axios.post(`${API_URL}/api/upload`, formData);
          await axios.put(
            `${API_URL}/api/events/${plan._id}`,
            {
              img: res.data.imageUrl,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setImageUrl(res.data.imageUrl);
        }
      }
    } catch (error) {
      Alert.alert("Error", error.response.data);
      console.log(error);
    }
  };

  const { triggerRefetch } = refetchData();

  const handleRedirect = () => {
    triggerRefetch();
    navigation.navigate("PlanDetail");
  };

  return (
    <LinearGradient colors={["#000", "#7D0166"]} start={[0, 0]} end={[1, 1]}>
      <Navbar />
      <View style={styles.buttonNavbar}>
        <TouchableOpacity onPress={handleRedirect} style={styles.leftButton}>
          <AntDesign name="back" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRedirect} style={styles.rightButton}>
          <EvilIcons name="trash" size={45} color="red" />
        </TouchableOpacity>
      </View>

      {plan._id ? (
        <ScrollView>
          <Text style={[styles.text, { marginTop: "3%", paddingBottom: "0%" }]}>
            Imagen:
          </Text>
          <TouchableOpacity
            style={[
              styles.container,
              { borderBottomColor: "white", borderBottomWidth: 1 },
            ]}
            onPress={selectImage}
          >
            {imageUrl && (
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.image}
              />
            )}
          </TouchableOpacity>
          <View style={styles.privateEvent}>
            <Text style={styles.text}>Evento Privado?</Text>
            <View style={{ marginTop: "2%" }}>
              {checked ? (
                <TouchableOpacity onPress={handleCheckBoxToggle}>
                  <Feather name="lock" size={24} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleCheckBoxToggle}>
                  <Feather name="unlock" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.container}>
            <ChangeData
              keyboardType="default"
              baseData={plan?.title}
              propName={"title"}
              mode={"event"}
              data="Título"
              styles={styles}
            />
            <ChangeData
              keyboardType="default"
              baseData={plan?.description}
              propName={"description"}
              mode={"event"}
              data="Descripción"
              styles={styles}
            />
            <ChangeData
              keyboardType="default"
              baseData={plan?.location}
              propName={"location"}
              mode={"event"}
              data="Ubicación"
              styles={styles}
            />
            <ChangeData
              keyboardType="date"
              baseData={plan?.event_date}
              propName={"event_date"}
              mode={"event"}
              data="Fecha"
              styles={styles}
            />
            <ChangeData
              keyboardType="numeric"
              baseData={plan?.start_time}
              propName={"start_time"}
              mode={"event"}
              data="Hora de inicio"
              styles={styles}
            />
            <ChangeData
              keyboardType="numeric"
              baseData={plan?.end_time}
              propName={"end_time"}
              mode={"event"}
              data="Hora de finalización"
              styles={styles}
            />
            <ChangeData
              keyboardType="numeric"
              baseData={plan?.min_age}
              propName={"min_age"}
              mode={"event"}
              data="Edad mínima"
              styles={styles}
            />
            <ChangeData
              keyboardType="numeric"
              baseData={plan?.max_age}
              propName={"max_age"}
              mode={"event"}
              data="Edad máxima"
              styles={styles}
            />
            <ChangeData
              keyboardType="numeric"
              baseData={plan?.min_to_pay}
              propName={"min_to_pay"}
              mode={"event"}
              data="Mínimo a pagar"
              styles={styles}
            />
            <ChangeData
              keyboardType="numeric"
              baseData={plan?.total_to_pay}
              propName={"total_to_pay"}
              mode={"event"}
              data="Total a pagar"
              styles={styles}
            />

            <ModalSelector
              data={categories}
              onChange={async (option) => {
                const token = await AsyncStorage.getItem("token");
                if (token) {
                  await axios.put(
                    `${API_URL}/api/events/${plan._id}`,
                    {
                      category: option.label,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  setCategory(option.label);
                }
              }}
              overlayStyle={{ backgroundColor: "transparent" }}
              optionContainerStyle={{
                backgroundColor: "#691359",
                borderWidth: 8,
                borderRadius: 4,
                borderColor: "#59104c",
              }}
              optionTextStyle={{
                fontWeight: "bold",
                color: "white",
              }}
              cancelStyle={{
                backgroundColor: "#781365",
              }}
              cancelTextStyle={{
                fontWeight: "bold",
                color: "white",
              }}
              cancelText="Cancelar"
            >
              <Text style={styles.categoryContainer} value={category}>
                {category}
                <Image
                  source={ChevronImg}
                  resizeMode="contain"
                  style={{ width: 20, height: 20 }}
                />
              </Text>
            </ModalSelector>

            <ChangeData
              keyboardType="default"
              baseData={plan?.link_to_pay}
              propName={"link_to_pay"}
              mode={"event"}
              data="Link para pagar"
              styles={styles}
            />

            <View style={{ marginBottom: "40%" }} />
          </View>
        </ScrollView>
      ) : (
        <LoginScreen />
      )}
    </LinearGradient>
  );
}
