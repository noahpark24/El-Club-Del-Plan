import React, { useEffect, useState } from "react";
import {
  Dimensions,
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserPlans } from "../services/getUserPlans";
import { styles } from "../styles/PlanDetailsStyles";
import { useSelector, useDispatch } from "react-redux";
import { setUserPlans } from "../state/user";
import axios from "axios";
import { API_URL } from "../services/urls";
import Comments from "./Comments";
import Rating from "./Rating";
import { GenericButton } from "./GenericButton";
import MultipleDropdown from "./MultipleDropdown";
import { useNavigation } from "@react-navigation/core";
import refetchData from "../services/refetchData";
import RadioButton from "./RadioButton";
import { Entypo, Feather } from "@expo/vector-icons";
import { getUserFriends } from "../services/getUserFriends";
import fecha from "../assets/fecha.png";
import descripcion from "../assets/descripcion.png";
import organizador from "../assets/organizador.png";

export const PlanDetailCard = () => {
  const dispatch = useDispatch();
  const plan = useSelector((state) => state.selectedPlan);
  const user = useSelector((state) => state.user);
  const screenHeight = Dimensions.get("window").height;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [invited, setInvited] = useState([]);
  const navigation = useNavigation();
  const [canEdit, setCanEdit] = useState(false);
  const { triggerRefetch } = refetchData();

  const sendMethods = [
    { label: "Email", value: "email" },
    { label: "WhatsApp", value: "phone" },
  ];

  const [sendMethod, setSendMethod] = useState(sendMethods[0].value);

  const fetchInfo = async () => {
    try {
      let users = await getUserFriends();
      users = users.map((item) => ({
        username: item.username,
        email: item.email,
        phone: item.phone,
      }));
      setUsers(users);

      let friends = users.filter((item) => item.email);
      friends = friends.map((item) => ({
        label: item.username,
        value: item.email,
      }));
      setFriends(friends);

      const token = await AsyncStorage.getItem("token");
      if (token) {
        res = await axios.get(`${API_URL}/api/events/${plan._id}/can-update`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCanEdit(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleChange = (method) => {
    try {
      let friends = users.filter((item) => item[method]);
      friends = friends.map((item) => ({
        label: item.username,
        value: item[method],
      }));
      setSendMethod(method);
      setFriends(friends);
    } catch (error) {
      console.log(error);
    }
  };
  const formattingDate = plan?.event_date
    .split("T")[0]
    .split("-")
    .reverse()
    .join("/");

  const handleInvite = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/api/users/invite`,
          {
            users: invited,
            plan,
            method: sendMethod,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Alert.alert("OK", "Invitaciones enviadas");
      } else {
        Alert.alert("Error", "Error de autenticación");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al enviar invitaciones");
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        await axios.post(
          `${API_URL}/api/events/enroll`,
          { eventId: plan._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const newPlans = await getUserPlans();
        dispatch(setUserPlans(newPlans));
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleStopParticipating = async (id) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`${API_URL}/api/events/stop-participating/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newPlans = await getUserPlans();
      dispatch(setUserPlans(newPlans));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await axios.delete(`${API_URL}/api/events/${plan._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        triggerRefetch();
        navigation.navigate("HomeScreen");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView>
      <View style={{ minHeight: screenHeight }}>
        <View style={styles.card}>
          <Text style={styles.title}>{plan?.title}</Text>
          <Image
            source={{ uri: plan?.img }}
            style={{
              width: "100%",
              height: 200,
            }}
          />
          <View style={styles.detailsContainer}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {plan.ended ? (
                <View>
                  <Text style={styles.subtitle}>
                    El evento finalizó el {formattingDate}
                  </Text>

                  {user._id &&
                    user.history &&
                    user.history.some((item) => item._id == plan._id) &&
                    plan.organizer &&
                    plan.ended && <Rating plan={plan} />}
                  <View style={styles.pContainer}>
                    <Text style={styles.p}>
                      {plan?.organizer?.rating?.toFixed(2)}/5.00{" "}
                      <Entypo name="star" size={20} color={"#fdd835"} />
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.date}>
                  <Image style={styles.logo} source={fecha} />
                  <Text style={styles.text2}>{formattingDate}</Text>
                </View>
              )}
              {canEdit && !plan.ended && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("EditPlan");
                  }}
                  style={{ alignSelf: "flex-start" }}
                >
                  <Feather name="edit" size={28} color="white" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.orgCont, { alignSelf: "flex-start" }]}>
                <Image style={styles.logo5} source={organizador} />
                <Text style={styles.text6}>{plan?.organizer?.username}</Text>
                <View style={{ right: "-300%", justifyContent: "center" }}>
                  {plan?.private ? (
                    <Text style={{ color: "white" }}>
                      Privado {<Feather name="lock" size={24} color="white" />}
                    </Text>
                  ) : (
                    <Text style={{ color: "white" }}>
                      Público{" "}
                      {<Feather name="unlock" size={28} color="white" />}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <Image style={styles.logo3} source={descripcion} />
            <Text style={styles.text3}>{plan.description}</Text>
            <View>
              {user._id && !plan.ended && !canEdit && (
                <View>
                  {loading ? (
                    <GenericButton
                      text={"Cargando..."}
                      customStyle={[styles.btn, styles.loadingBtn]}
                    />
                  ) : (
                    <>
                      {!user.plans?.some(
                        (userPlan) => userPlan._id === plan._id
                      ) ? (
                        <GenericButton
                          text={"Participar"}
                          onPress={handleEnroll}
                          customStyle={styles.btn}
                        />
                      ) : (
                        <GenericButton
                          text={"Dejar de Participar"}
                          onPress={() => handleStopParticipating(plan._id)}
                          customStyle={styles.btn}
                        />
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
            <Comments />
            {canEdit && !plan.ended && (
              <>
                <View style={styles.input}>
                  <MultipleDropdown
                    setSelected={(val) => setInvited(val)}
                    data={friends}
                    save="value"
                    onSelect={() => {}}
                    label="Invitar personas"
                    placeholder="Invitar personas"
                    search={false}
                    textStyles={styles.item}
                    boxStyles={styles.dropdown}
                    dropdownStyles={styles.dropdown}
                    badgeStyles={styles.item}
                  />
                  <RadioButton
                    options={sendMethods}
                    onSelect={handleChange}
                    defaultValue={sendMethod}
                  />
                </View>
                {invited && invited[0] && (
                  <GenericButton
                    text={"Invitar"}
                    customStyle={[styles.input, { marginLeft: "10%" }]}
                    onPress={handleInvite}
                  />
                )}
              </>
            )}
            <View style={{ marginBottom: 10 }}></View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
