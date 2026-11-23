// ============================================================================
// BACKEND TEMPLATE REGISTRY
// ----------------------------------------------------------------------------
// Generated from the real template registry of classes.py (HSEDocumentGeneratorHub, incl. new_backend_templates.py,
// 423 template IDs). The Documents page only offers a document when its template ID is in
// BACKEND_TEMPLATE_IDS, so a user never reaches a document the server cannot generate.
//
// WHEN YOU ADD A TEMPLATE TO THE BACKEND:
//   1. Add its exact template ID to BACKEND_TEMPLATE_IDS.
//   2. If a frontend document should use it, add  documentValue: 'template_id'  to DOC_BACKEND_ALIASES
//      (or set that document's template_id in the page). The document then appears automatically.
// ============================================================================

export const BACKEND_TEMPLATE_IDS = new Set([
  "agriculture_get_agriculture_specialized_chemical_storage_safety_plan",
  "agriculture_get_agriculture_specialized_irrigation_safety_plan",
  "agriculture_get_agriculture_specialized_livestock_safety_plan",
  "agriculture_get_agriculture_specialized_pesticide_safety_plan",
  "agriculture_get_risk_assessments_barn_safety",
  "agriculture_get_risk_assessments_grain_handling_safety",
  "agriculture_get_risk_assessments_harvesting_safety",
  "agriculture_get_risk_assessments_machinery_safety",
  "audit_get_audit_templates_safety_audit_checklist",
  "audit_report",
  "aviation_get_aviation_specialized_aircraft_maintenance_logs",
  "aviation_get_aviation_specialized_flight_safety_reports",
  "aviation_get_aviation_specialized_fuel_safety_compliance",
  "aviation_get_aviation_specialized_hangar_safety_plan",
  "aviation_get_aviation_specialized_ramp_safety_inspections",
  "aviation_get_permit_templates_aircraft_refueling",
  "aviation_get_permit_templates_apu_operation",
  "aviation_get_permit_templates_cargo_loading_aviation",
  "aviation_get_permit_templates_confined_space_aviation",
  "aviation_get_permit_templates_deicing",
  "aviation_get_permit_templates_engine_run",
  "aviation_get_permit_templates_fuel_tank_entry",
  "aviation_get_permit_templates_ground_power",
  "aviation_get_permit_templates_hot_work_aviation",
  "aviation_get_permit_templates_ramp_entry",
  "aviation_get_risk_assessments_air_traffic_control",
  "aviation_get_risk_assessments_aircraft_ground",
  "aviation_get_risk_assessments_bird_strike_management",
  "aviation_get_risk_assessments_cabin_safety",
  "aviation_get_risk_assessments_dangerous_goods_comprehensive",
  "aviation_get_risk_assessments_emergency_evacuation",
  "aviation_get_risk_assessments_engine_run",
  "aviation_get_risk_assessments_fatigue_management",
  "aviation_get_risk_assessments_flight_operations",
  "aviation_get_risk_assessments_fuel_handling",
  "aviation_get_risk_assessments_ground_handling_comprehensive",
  "aviation_get_risk_assessments_human_remains",
  "aviation_get_risk_assessments_maintenance_errors",
  "aviation_get_risk_assessments_ramp_operations",
  "aviation_get_risk_assessments_security_screening",
  "aviation_get_risk_assessments_security_threat",
  "aviation_get_risk_assessments_weather_operations",
  "business_continuity_plan",
  "checklist",
  "chemical_get_permit_templates_chemical_transfer",
  "chemical_get_permit_templates_confined_space_chemical",
  "chemical_get_permit_templates_exothermic_reaction",
  "chemical_get_permit_templates_high_pressure",
  "chemical_get_permit_templates_hot_work_chemical",
  "chemical_get_permit_templates_line_breaking",
  "chemical_get_permit_templates_maintenance_chemical",
  "chemical_get_permit_templates_reactor_entry",
  "chemical_get_permit_templates_sampling_permit",
  "chemical_get_permit_templates_tank_entry_chemical",
  "chemical_get_risk_assessments_chemical_release",
  "chemical_get_risk_assessments_corrosion_control",
  "chemical_get_risk_assessments_emergency_response",
  "chemical_get_risk_assessments_environmental_impact",
  "chemical_get_risk_assessments_material_compatibility",
  "chemical_get_risk_assessments_personal_protection",
  "chemical_get_risk_assessments_process_safety",
  "chemical_get_risk_assessments_reactor_safety",
  "chemical_get_risk_assessments_regulatory_compliance",
  "chemical_get_risk_assessments_storage_handling",
  "chemical_get_risk_assessments_toxic_exposure",
  "chemical_get_risk_assessments_transportation_risks",
  "chemical_get_risk_assessments_ventilation_systems",
  "chemical_get_risk_assessments_waste_management",
  "chemicalsafety_get_chemical_templates_chemical_safety_assessment",
  "compliance_get_compliance_templates_hazard_communication_plan",
  "construction_get_construction_specialized_concrete_pouring_permit",
  "construction_get_construction_specialized_crane_operation_log",
  "construction_get_construction_specialized_excavation_permit",
  "construction_get_construction_specialized_painting_work_safety_plan",
  "construction_get_construction_specialized_scaffold_inspection_certificate",
  "construction_get_jsa_templates_concrete_pour_jsa",
  "construction_get_jsa_templates_confined_space_jsa",
  "construction_get_jsa_templates_crane_lift_jsa",
  "construction_get_jsa_templates_demolition_jsa",
  "construction_get_jsa_templates_electrical_jsa",
  "construction_get_jsa_templates_excavation_jsa",
  "construction_get_jsa_templates_hot_work_jsa",
  "construction_get_jsa_templates_roofing_jsa",
  "construction_get_jsa_templates_scaffold_erection_jsa",
  "construction_get_jsa_templates_steel_erection_jsa",
  "construction_get_msds_documents_adhesives_msds",
  "construction_get_msds_documents_asphalt_msds",
  "construction_get_msds_documents_cement_msds",
  "construction_get_msds_documents_cleaning_chemicals_msds",
  "construction_get_msds_documents_concrete_additives_msds",
  "construction_get_msds_documents_epoxy_msds",
  "construction_get_msds_documents_fuel_msds",
  "construction_get_msds_documents_oils_greases_msds",
  "construction_get_msds_documents_paint_msds",
  "construction_get_msds_documents_solvents_msds",
  "construction_get_permit_templates_cold_work",
  "construction_get_permit_templates_confined_space",
  "construction_get_permit_templates_electrical",
  "construction_get_permit_templates_excavation",
  "construction_get_permit_templates_height_work",
  "construction_get_permit_templates_hot_work",
  "construction_get_permit_templates_lifting",
  "construction_get_risk_assessments_concrete_placement",
  "construction_get_risk_assessments_crane_operations",
  "construction_get_risk_assessments_demolition_operations",
  "construction_get_risk_assessments_electrical_installation",
  "construction_get_risk_assessments_environmental_impact",
  "construction_get_risk_assessments_mechanical_installation",
  "construction_get_risk_assessments_piling_operations",
  "construction_get_risk_assessments_roofing_operations",
  "construction_get_risk_assessments_scaffolding",
  "construction_get_risk_assessments_steel_erection",
  "construction_get_risk_assessments_structural_work",
  "construction_get_risk_assessments_temporary_works",
  "construction_get_risk_assessments_traffic_management",
  "construction_get_risk_assessments_trenching_excavation",
  "construction_get_risk_assessments_underground_work",
  "contractormanagement_get_contractor_templates_contractor_induction_record",
  "contractormanagement_get_contractor_templates_contractor_performance_evaluation",
  "contractormanagement_get_contractor_templates_contractor_prequalification",
  "contractormanagement_get_contractor_templates_contractor_safety_agreement",
  "contractormanagement_get_contractor_templates_contractor_safety_assessment",
  "contractormanagement_get_contractor_templates_subcontractor_management_plan",
  "education_get_permit_templates_after_hours",
  "education_get_permit_templates_chemical_lab",
  "education_get_permit_templates_contractor_access",
  "education_get_permit_templates_event_permit",
  "education_get_permit_templates_facility_access",
  "education_get_permit_templates_field_trip",
  "education_get_permit_templates_lab_work",
  "education_get_permit_templates_maintenance_work",
  "education_get_permit_templates_science_demo",
  "education_get_permit_templates_sports_activity",
  "education_get_risk_assessments_child_protection",
  "education_get_risk_assessments_classroom_safety",
  "education_get_risk_assessments_emergency_preparedness",
  "education_get_risk_assessments_field_trips",
  "education_get_risk_assessments_fire_safety",
  "education_get_risk_assessments_food_service",
  "education_get_risk_assessments_laboratory_safety",
  "education_get_risk_assessments_maintenance_activities",
  "education_get_risk_assessments_playground_safety",
  "education_get_risk_assessments_special_needs",
  "education_get_risk_assessments_sports_activities",
  "education_get_risk_assessments_staff_training",
  "education_get_risk_assessments_transportation_safety",
  "education_get_risk_assessments_visitor_management",
  "emergency_response_plan",
  "emergencyresponse_get_emergency_templates_emergency_contact_list",
  "emergencyresponse_get_emergency_templates_emergency_response_plan",
  "emergencyresponse_get_emergency_templates_evacuation_procedure",
  "emergencyresponse_get_emergency_templates_fire_emergency_plan",
  "emergencyresponse_get_emergency_templates_medical_emergency_protocol",
  "emergencyresponse_get_emergency_templates_rescue_operations_plan",
  "emergencyresponse_get_emergency_templates_spill_response_plan",
  "energy_get_permit_templates_energy_permit",
  "energy_get_risk_assessments_cyber_security",
  "energy_get_risk_assessments_distribution_networks",
  "energy_get_risk_assessments_emergency_shutdown",
  "energy_get_risk_assessments_energy_storage",
  "energy_get_risk_assessments_environmental_compliance",
  "energy_get_risk_assessments_high_voltage",
  "energy_get_risk_assessments_maintenance_operations",
  "energy_get_risk_assessments_power_generation",
  "energy_get_risk_assessments_public_safety",
  "energy_get_risk_assessments_renewable_energy",
  "energy_get_risk_assessments_smart_grid_operations",
  "energy_get_risk_assessments_substation_safety",
  "energy_get_risk_assessments_transmission_lines",
  "energy_get_risk_assessments_turbine_operations",
  "environmental_get_env_templates_environmental_management_plan",
  "environmental_get_environmental_templates_chemical_management_plan",
  "environmental_get_environmental_templates_emissions_monitoring_report",
  "environmental_get_environmental_templates_environmental_impact_assessment",
  "environmental_get_environmental_templates_pollution_prevention_plan",
  "environmental_get_environmental_templates_sustainability_report",
  "environmental_get_environmental_templates_waste_management_plan",
  "equipmentsafety_get_equipment_templates_calibration_records",
  "equipmentsafety_get_equipment_templates_equipment_inspection_checklist",
  "equipmentsafety_get_equipment_templates_lifting_equipment_certificate",
  "equipmentsafety_get_equipment_templates_machine_guarding_assessment",
  "equipmentsafety_get_equipment_templates_pressure_vessel_inspection",
  "equipmentsafety_get_equipment_templates_preventive_maintenance_schedule",
  "fire_safety_plan",
  "foodbeverage_get_permit_templates_food_beverage_permit",
  "general_audit_report",
  "general_business_continuity_plan",
  "general_checklist",
  "general_emergency_response_plan",
  "general_fire_safety_plan",
  "general_general_checklist",
  "general_general_inspection",
  "general_get_permit_templates_chemical_handling_general",
  "general_get_permit_templates_confined_space_general",
  "general_get_permit_templates_contractor_general",
  "general_get_permit_templates_electrical_general",
  "general_get_permit_templates_excavation_general",
  "general_get_permit_templates_hot_work_general",
  "general_get_permit_templates_lifting_operations",
  "general_get_permit_templates_maintenance_general",
  "general_get_permit_templates_safety_hold",
  "general_get_permit_templates_working_at_height",
  "general_inspection",
  "general_risk_assessment",
  "general_safety_management_system",
  "general_sop",
  "general_training_material",
  "general_transportation_safety_plan",
  "generalsafetydocuments_get_templates_audit_report",
  "generalsafetydocuments_get_templates_business_continuity_plan",
  "generalsafetydocuments_get_templates_checklist",
  "generalsafetydocuments_get_templates_emergency_response_plan",
  "generalsafetydocuments_get_templates_fire_safety_plan",
  "generalsafetydocuments_get_templates_general_checklist",
  "generalsafetydocuments_get_templates_general_inspection",
  "generalsafetydocuments_get_templates_risk_assessment",
  "generalsafetydocuments_get_templates_safety_management_system",
  "generalsafetydocuments_get_templates_sop",
  "generalsafetydocuments_get_templates_training_material",
  "generalsafetydocuments_get_templates_transportation_safety_plan",
  "healthcare_get_healthcare_specialized_biohazard_waste_tracking",
  "healthcare_get_healthcare_specialized_infection_control_audit",
  "healthcare_get_healthcare_specialized_medical_device_safety",
  "healthcare_get_healthcare_specialized_patient_safety_report",
  "healthcare_get_permit_templates_healthcare_permit",
  "healthcare_get_risk_assessments_biohazard_exposure",
  "healthcare_get_risk_assessments_elderly_care_risks",
  "healthcare_get_risk_assessments_emergency_department",
  "healthcare_get_risk_assessments_icu_critical_care",
  "healthcare_get_risk_assessments_infection_control",
  "healthcare_get_risk_assessments_laboratory_safety",
  "healthcare_get_risk_assessments_medical_device_safety",
  "healthcare_get_risk_assessments_medication_safety",
  "healthcare_get_risk_assessments_mental_health_risks",
  "healthcare_get_risk_assessments_patient_handling",
  "healthcare_get_risk_assessments_pediatric_safety",
  "healthcare_get_risk_assessments_pharmaceutical_handling",
  "healthcare_get_risk_assessments_radiation_safety",
  "healthcare_get_risk_assessments_surgical_safety",
  "healthhygiene_get_health_templates_air_monitoring_report",
  "healthhygiene_get_health_templates_biological_monitoring",
  "healthhygiene_get_health_templates_ergonomic_assessment",
  "healthhygiene_get_health_templates_health_surveillance_program",
  "healthhygiene_get_health_templates_noise_monitoring_report",
  "healthhygiene_get_health_templates_workplace_hygiene_survey",
  "hospitality_get_permit_templates_hospitality_permit",
  "incidentmanagement_get_incident_templates_corrective_action_plan",
  "incidentmanagement_get_incident_templates_incident_investigation_report",
  "incidentmanagement_get_incident_templates_incident_report_form",
  "incidentmanagement_get_incident_templates_lessons_learned_report",
  "incidentmanagement_get_incident_templates_near_miss_report",
  "incidentmanagement_get_incident_templates_root_cause_analysis",
  "inspectionmonitoring_get_inspection_templates_compliance_inspection_checklist",
  "inspectionmonitoring_get_inspection_templates_daily_safety_inspection",
  "inspectionmonitoring_get_inspection_templates_hazard_observation_report",
  "inspectionmonitoring_get_inspection_templates_inspection_report",
  "inspectionmonitoring_get_inspection_templates_safety_tour_report",
  "inspectionmonitoring_get_inspection_templates_safety_walkthrough_checklist",
  "inspectionmonitoring_get_inspection_templates_workplace_inspection_report",
  "lighting_get_lighting_templates_lighting_assessment",
  "manufacturing_get_jsa_templates_assembly_line_jsa",
  "manufacturing_get_jsa_templates_chemical_mixing_jsa",
  "manufacturing_get_jsa_templates_conveyor_maintenance_jsa",
  "manufacturing_get_jsa_templates_forklift_operation_jsa",
  "manufacturing_get_jsa_templates_grinding_jsa",
  "manufacturing_get_jsa_templates_lockout_tagout_jsa",
  "manufacturing_get_jsa_templates_machine_operation_jsa",
  "manufacturing_get_jsa_templates_press_operation_jsa",
  "manufacturing_get_jsa_templates_robotic_cell_jsa",
  "manufacturing_get_jsa_templates_welding_jsa",
  "manufacturing_get_manufacturing_specialized_chemical_handling_protocols",
  "manufacturing_get_manufacturing_specialized_lockout_tagout_procedures",
  "manufacturing_get_manufacturing_specialized_machine_safety_certifications",
  "manufacturing_get_manufacturing_specialized_production_line_safety_reviews",
  "manufacturing_get_method_statements_changeover_procedure",
  "manufacturing_get_method_statements_cleaning_procedure",
  "manufacturing_get_method_statements_machine_setup_method",
  "manufacturing_get_method_statements_maintenance_procedure",
  "manufacturing_get_method_statements_material_handling_method",
  "manufacturing_get_method_statements_packaging_method",
  "manufacturing_get_method_statements_production_line_method",
  "manufacturing_get_method_statements_quality_control_method",
  "manufacturing_get_permit_templates_chemical_handling",
  "manufacturing_get_permit_templates_confined_space_manufacturing",
  "manufacturing_get_permit_templates_electrical_manufacturing",
  "manufacturing_get_permit_templates_forklift_operation",
  "manufacturing_get_permit_templates_hot_work_manufacturing",
  "manufacturing_get_permit_templates_line_maintenance",
  "manufacturing_get_permit_templates_lockout_tagout",
  "manufacturing_get_permit_templates_machine_maintenance",
  "manufacturing_get_permit_templates_press_operation",
  "manufacturing_get_permit_templates_robotic_cell",
  "manufacturing_get_risk_assessments_chemical_exposure",
  "manufacturing_get_risk_assessments_electrical_safety",
  "manufacturing_get_risk_assessments_ergonomic_hazards",
  "manufacturing_get_risk_assessments_fire_safety",
  "manufacturing_get_risk_assessments_lockout_tagout",
  "manufacturing_get_risk_assessments_machine_guarding",
  "manufacturing_get_risk_assessments_maintenance_operations",
  "manufacturing_get_risk_assessments_material_handling",
  "manufacturing_get_risk_assessments_noise_exposure",
  "manufacturing_get_risk_assessments_pressurized_systems",
  "manufacturing_get_risk_assessments_quality_control",
  "manufacturing_get_risk_assessments_robotics_automation",
  "manufacturing_get_risk_assessments_supply_chain_risks",
  "manufacturing_get_risk_assessments_warehouse_operations",
  "maritime_get_maritime_specialized_environmental_safety_plan",
  "maritime_get_permit_templates_maritime_permit",
  "maritime_get_risk_assessments_anchoring_operations",
  "maritime_get_risk_assessments_bunkering",
  "maritime_get_risk_assessments_cargo_operations",
  "maritime_get_risk_assessments_chemical_handling_permit",
  "maritime_get_risk_assessments_confined_space_entry",
  "maritime_get_risk_assessments_confined_space_permit",
  "maritime_get_risk_assessments_crane_operations",
  "maritime_get_risk_assessments_crane_permit",
  "maritime_get_risk_assessments_crew_safety",
  "maritime_get_risk_assessments_deck_operations",
  "maritime_get_risk_assessments_electrical_permit",
  "maritime_get_risk_assessments_electrical_safety",
  "maritime_get_risk_assessments_emergency_response",
  "maritime_get_risk_assessments_enclosed_spaces",
  "maritime_get_risk_assessments_engine_room_safety",
  "maritime_get_risk_assessments_excavation_permit",
  "maritime_get_risk_assessments_fire_safety",
  "maritime_get_risk_assessments_heavy_lifting",
  "maritime_get_risk_assessments_hot_work",
  "maritime_get_risk_assessments_hot_work_permit",
  "maritime_get_risk_assessments_lifeboat_drills",
  "maritime_get_risk_assessments_lifting_permit",
  "maritime_get_risk_assessments_man_overboard",
  "maritime_get_risk_assessments_mooring_operations",
  "maritime_get_risk_assessments_navigation_safety",
  "maritime_get_risk_assessments_onshore_support",
  "maritime_get_risk_assessments_personnel_transfer",
  "maritime_get_risk_assessments_piracy_security",
  "maritime_get_risk_assessments_port_operations",
  "maritime_get_risk_assessments_radiography_permit",
  "maritime_get_risk_assessments_scaffolding",
  "maritime_get_risk_assessments_ship_handling",
  "maritime_get_risk_assessments_shipyard_safety",
  "maritime_get_risk_assessments_towing_operations",
  "maritime_get_risk_assessments_vessel_maintenance",
  "maritime_get_risk_assessments_vessel_safety",
  "maritime_get_risk_assessments_weather_operations",
  "maritime_get_risk_assessments_welding_permit",
  "maritime_get_risk_assessments_work_at_height",
  "maritime_get_risk_assessments_work_at_height_permit",
  "mining_get_jsa_templates_confined_space_jsa",
  "mining_get_jsa_templates_conveyor_maintenance_jsa",
  "mining_get_jsa_templates_crusher_operation_jsa",
  "mining_get_jsa_templates_drilling_blasting_jsa",
  "mining_get_jsa_templates_electrical_maintenance_jsa",
  "mining_get_jsa_templates_emergency_rescue_jsa",
  "mining_get_jsa_templates_ground_control_jsa",
  "mining_get_jsa_templates_haul_truck_operation_jsa",
  "mining_get_jsa_templates_shaft_sinking_jsa",
  "mining_get_jsa_templates_ventilation_installation_jsa",
  "mining_get_method_statements_blasting_procedure",
  "mining_get_method_statements_dewatering_method",
  "mining_get_method_statements_exploration_method",
  "mining_get_method_statements_extraction_method",
  "mining_get_method_statements_ground_support_method",
  "mining_get_method_statements_processing_method",
  "mining_get_method_statements_rehabilitation_method",
  "mining_get_method_statements_ventilation_method",
  "mining_get_mining_specialized_tailings_management_plan",
  "mining_get_permit_templates_blast_zone_entry",
  "mining_get_permit_templates_confined_space_mining",
  "mining_get_permit_templates_emergency_response_mining",
  "mining_get_permit_templates_ground_control",
  "mining_get_permit_templates_high_voltage_mining",
  "mining_get_permit_templates_hot_work_mining",
  "mining_get_permit_templates_shaft_work",
  "mining_get_permit_templates_vehicle_entry",
  "mining_get_permit_templates_ventilation_work",
  "mining_get_permit_templates_water_management",
  "mining_get_risk_assessments_contractor_management",
  "mining_get_risk_assessments_dust_exposure",
  "mining_get_risk_assessments_electrical_safety",
  "mining_get_risk_assessments_emergency_response",
  "mining_get_risk_assessments_environmental_impact",
  "mining_get_risk_assessments_equipment_maintenance",
  "mining_get_risk_assessments_explosives_handling",
  "mining_get_risk_assessments_ground_control",
  "mining_get_risk_assessments_mine_rescue",
  "mining_get_risk_assessments_slope_stability",
  "mining_get_risk_assessments_surface_operations",
  "mining_get_risk_assessments_training_competency",
  "mining_get_risk_assessments_underground_operations",
  "mining_get_risk_assessments_vehicle_interaction",
  "mining_get_risk_assessments_ventilation_systems",
  "mining_get_risk_assessments_water_management",
  "oilgas_get_method_statements_drilling_procedure",
  "oilgas_get_method_statements_emergency_response_method",
  "oilgas_get_method_statements_environmental_protection_method",
  "oilgas_get_method_statements_pipe_inspection_method",
  "oilgas_get_method_statements_rig_inspection_method",
  "oilgas_get_method_statements_safety_case_method",
  "oilgas_get_method_statements_simops_procedure",
  "oilgas_get_method_statements_well_control_method",
  "oilgas_get_oilgas_specialized_bowtie_assessment",
  "oilgas_get_oilgas_specialized_gas_processing_safety_plan",
  "oilgas_get_oilgas_specialized_hazop_study",
  "oilgas_get_oilgas_specialized_safety_case",
  "oilgas_get_oilgas_specialized_simops_plan",
  "oilgas_get_oilgas_specialized_transportation_safety_plan",
  "oilgas_get_oilgas_specialized_well_servicing_permit",
  "oilgas_get_permit_templates_confined_space",
  "oilgas_get_permit_templates_electrical",
  "oilgas_get_permit_templates_excavation",
  "oilgas_get_permit_templates_h2s_entry",
  "oilgas_get_permit_templates_hot_work",
  "oilgas_get_permit_templates_lifting",
  "oilgas_get_risk_assessments_confined_space_entry",
  "oilgas_get_risk_assessments_drilling_operations",
  "oilgas_get_risk_assessments_emergency_response",
  "oilgas_get_risk_assessments_environmental_protection",
  "oilgas_get_risk_assessments_h2s_exposure",
  "oilgas_get_risk_assessments_hot_work_operations",
  "oilgas_get_risk_assessments_hydrocarbon_release",
  "oilgas_get_risk_assessments_lifting_operations",
  "oilgas_get_risk_assessments_offshore_operations",
  "oilgas_get_risk_assessments_permit_to_work",
  "oilgas_get_risk_assessments_pipeline_integrity",
  "oilgas_get_risk_assessments_process_safety_management",
  "oilgas_get_risk_assessments_production_operations",
  "oilgas_get_risk_assessments_simultaneous_operations",
  "oilgas_get_risk_assessments_well_control",
  "operationalsafety_get_operational_templates_job_safety_analysis",
  "operationalsafety_get_operational_templates_permit_to_work_log",
  "operationalsafety_get_operational_templates_pre_task_briefing",
  "operationalsafety_get_operational_templates_safe_work_method_statement",
  "operationalsafety_get_operational_templates_shift_handover_checklist",
  "operationalsafety_get_operational_templates_toolbox_talk_record",
  "pharmaceutical_get_permit_templates_pharmaceutical_permit",
  "ppe_get_ppe_templates_ppe_assessment",
  "quality_get_quality_templates_quality_management_plan",
  "retail_get_permit_templates_retail_permit",
  "risk_assessment",
  "riskmanagement_get_risk_templates_risk_management_plan",
  "safety_management_system",
  "safetymanagement_get_management_templates_management_review_report",
  "safetymanagement_get_management_templates_safety_budget_plan",
  "safetymanagement_get_management_templates_safety_committee_minutes",
  "safetymanagement_get_management_templates_safety_kpi_dashboard",
  "safetymanagement_get_management_templates_safety_management_manual",
  "safetymanagement_get_management_templates_safety_meeting_agenda",
  "safetymanagement_get_management_templates_safety_policy_statement",
  "safetymanagement_get_management_templates_workplace_safety_policy",
  "sop",
  "telecom_get_permit_templates_telecom_permit",
  "training_get_training_templates_safety_orientation_checklist",
  "training_get_training_templates_safety_training_plan",
  "training_material",
  "transportation_get_permit_templates_transportation_permit",
  "transportation_safety_plan",
  "ventilation_get_vent_templates_ventilation_assessment"
]);

// Frontend document value -> real backend template ID (used when the document's own template_id
// does not exist on the server but an equivalent template does).
export const DOC_BACKEND_ALIASES = {
  "risk_assessment": "generalsafetydocuments_get_templates_risk_assessment",
  "emergency_evacuation_plan": "emergencyresponse_get_emergency_templates_evacuation_procedure",
  "incident_investigation": "incidentmanagement_get_incident_templates_incident_investigation_report",
  "workplace_hazard_report": "inspectionmonitoring_get_inspection_templates_hazard_observation_report",
  "environmental_assessment": "environmental_get_environmental_templates_environmental_impact_assessment",
  "safety_management_system": "generalsafetydocuments_get_templates_safety_management_system",
  "equipment_safety_checklist": "equipmentsafety_get_equipment_templates_equipment_inspection_checklist",
  "ergonomics_assessment": "healthhygiene_get_health_templates_ergonomic_assessment",
  "noise_exposure_assessment": "healthhygiene_get_health_templates_noise_monitoring_report",
  "construction_crane_operation": "construction_get_risk_assessments_crane_operations",
  "construction_electrical_safety": "construction_get_risk_assessments_electrical_installation",
  "construction_fall_protection": "construction_get_permit_templates_height_work",
  "construction_demolition_work": "construction_get_risk_assessments_demolition_operations",
  "construction_excavation_work": "construction_get_permit_templates_excavation",
  "construction_roof_work": "construction_get_risk_assessments_roofing_operations",
  "construction_concrete_work": "construction_get_risk_assessments_concrete_placement",
  "construction_steel_erection": "construction_get_risk_assessments_steel_erection",
  "construction_hoisting_work": "construction_get_permit_templates_lifting",
  "construction_welding_work": "construction_get_permit_templates_hot_work",
  "oilgas_well_control": "oilgas_get_risk_assessments_well_control",
  "oilgas_pipeline_safety": "oilgas_get_risk_assessments_pipeline_integrity",
  "oilgas_offshore_operations": "oilgas_get_risk_assessments_offshore_operations",
  "oilgas_refinery_safety": "oilgas_get_risk_assessments_process_safety_management",
  "manufacturing_conveyor_safety": "manufacturing_get_jsa_templates_conveyor_maintenance_jsa",
  "manufacturing_forklift_safety": "manufacturing_get_jsa_templates_forklift_operation_jsa",
  "manufacturing_warehouse_safety": "manufacturing_get_risk_assessments_warehouse_operations",
  "manufacturing_material_handling": "manufacturing_get_risk_assessments_material_handling",
  "manufacturing_assembly_line": "manufacturing_get_jsa_templates_assembly_line_jsa",
  "manufacturing_packaging_safety": "manufacturing_get_method_statements_packaging_method",
  "manufacturing_maintenance_safety": "manufacturing_get_risk_assessments_maintenance_operations",
  "manufacturing_quality_control": "manufacturing_get_risk_assessments_quality_control",
  "healthcare_medical_waste": "healthcare_get_healthcare_specialized_biohazard_waste_tracking",
  "healthcare_lab_safety": "healthcare_get_risk_assessments_laboratory_safety",
  "healthcare_radiation_safety": "healthcare_get_risk_assessments_radiation_safety",
  "healthcare_bloodborne_pathogens": "healthcare_get_risk_assessments_biohazard_exposure",
  "healthcare_surgical_safety": "healthcare_get_risk_assessments_surgical_safety",
  "healthcare_emergency_services": "healthcare_get_risk_assessments_emergency_department",
  "healthcare_pharmacy_safety": "healthcare_get_risk_assessments_pharmaceutical_handling",
  "healthcare_patient_handling": "healthcare_get_risk_assessments_patient_handling",
  "mining_ventilation_plan": "mining_get_method_statements_ventilation_method",
  "mining_blasting_operations": "mining_get_method_statements_blasting_procedure",
  "mining_shaft_safety": "mining_get_permit_templates_shaft_work",
  "mining_emergency_response": "mining_get_risk_assessments_emergency_response",
  "mining_equipment_safety": "mining_get_risk_assessments_equipment_maintenance",
  "aviation_ground_safety": "aviation_get_risk_assessments_aircraft_ground",
  "aviation_fuel_safety": "aviation_get_risk_assessments_fuel_handling",
  "aviation_emergency_response": "aviation_get_risk_assessments_emergency_evacuation",
  "aviation_maintenance_safety": "aviation_get_risk_assessments_maintenance_errors",
  "aviation_security_plan": "aviation_get_risk_assessments_security_threat",
  "maritime_port_safety": "maritime_get_risk_assessments_port_operations",
  "maritime_cargo_handling": "maritime_get_risk_assessments_cargo_operations",
  "maritime_emergency_response": "maritime_get_risk_assessments_emergency_response",
  "maritime_crew_safety": "maritime_get_risk_assessments_crew_safety"
};

// Documents for backend templates that the frontend list did not expose yet (one per template).
export const BACKEND_ONLY_DOCS = [
  {
    "value": "aviation_specialized_aircraft_maintenance_logs",
    "label": "Aircraft Maintenance Logs",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_aviation_specialized_aircraft_maintenance_logs"
  },
  {
    "value": "aviation_specialized_flight_safety_reports",
    "label": "Flight Safety Reports",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_aviation_specialized_flight_safety_reports"
  },
  {
    "value": "aviation_specialized_fuel_safety_compliance",
    "label": "Fuel Safety Compliance",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_aviation_specialized_fuel_safety_compliance"
  },
  {
    "value": "aviation_specialized_ramp_safety_inspections",
    "label": "Ramp Safety Inspections",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_aviation_specialized_ramp_safety_inspections"
  },
  {
    "value": "aviation_permit_aircraft_refueling",
    "label": "Aircraft Refueling Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_aircraft_refueling"
  },
  {
    "value": "aviation_permit_apu_operation",
    "label": "Apu Operation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_apu_operation"
  },
  {
    "value": "aviation_permit_cargo_loading_aviation",
    "label": "Cargo Loading Aviation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_cargo_loading_aviation"
  },
  {
    "value": "aviation_permit_confined_space_aviation",
    "label": "Confined Space Aviation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_confined_space_aviation"
  },
  {
    "value": "aviation_permit_deicing",
    "label": "Deicing Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_deicing"
  },
  {
    "value": "aviation_permit_engine_run",
    "label": "Engine Run Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_engine_run"
  },
  {
    "value": "aviation_permit_fuel_tank_entry",
    "label": "Fuel Tank Entry Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_fuel_tank_entry"
  },
  {
    "value": "aviation_permit_ground_power",
    "label": "Ground Power Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_ground_power"
  },
  {
    "value": "aviation_permit_hot_work_aviation",
    "label": "Hot Work Aviation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_hot_work_aviation"
  },
  {
    "value": "aviation_permit_ramp_entry",
    "label": "Ramp Entry Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_permit_templates_ramp_entry"
  },
  {
    "value": "aviation_risk_air_traffic_control",
    "label": "Air Traffic Control Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_air_traffic_control"
  },
  {
    "value": "aviation_risk_bird_strike_management",
    "label": "Bird Strike Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_bird_strike_management"
  },
  {
    "value": "aviation_risk_cabin_safety",
    "label": "Cabin Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_cabin_safety"
  },
  {
    "value": "aviation_risk_dangerous_goods_comprehensive",
    "label": "Dangerous Goods Comprehensive Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_dangerous_goods_comprehensive"
  },
  {
    "value": "aviation_risk_engine_run",
    "label": "Engine Run Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_engine_run"
  },
  {
    "value": "aviation_risk_fatigue_management",
    "label": "Fatigue Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_fatigue_management"
  },
  {
    "value": "aviation_risk_flight_operations",
    "label": "Flight Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_flight_operations"
  },
  {
    "value": "aviation_risk_ground_handling_comprehensive",
    "label": "Ground Handling Comprehensive Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_ground_handling_comprehensive"
  },
  {
    "value": "aviation_risk_human_remains",
    "label": "Human Remains Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_human_remains"
  },
  {
    "value": "aviation_risk_ramp_operations",
    "label": "Ramp Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_ramp_operations"
  },
  {
    "value": "aviation_risk_security_screening",
    "label": "Security Screening Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_security_screening"
  },
  {
    "value": "aviation_risk_weather_operations",
    "label": "Weather Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the aviation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "aviation"
    ],
    "template_id": "aviation_get_risk_assessments_weather_operations"
  },
  {
    "value": "chemical_permit_chemical_transfer",
    "label": "Chemical Transfer Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_chemical_transfer"
  },
  {
    "value": "chemical_permit_confined_space_chemical",
    "label": "Confined Space Chemical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_confined_space_chemical"
  },
  {
    "value": "chemical_permit_exothermic_reaction",
    "label": "Exothermic Reaction Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_exothermic_reaction"
  },
  {
    "value": "chemical_permit_high_pressure",
    "label": "High Pressure Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_high_pressure"
  },
  {
    "value": "chemical_permit_hot_work_chemical",
    "label": "Hot Work Chemical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_hot_work_chemical"
  },
  {
    "value": "chemical_permit_line_breaking",
    "label": "Line Breaking Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_line_breaking"
  },
  {
    "value": "chemical_permit_maintenance_chemical",
    "label": "Maintenance Chemical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_maintenance_chemical"
  },
  {
    "value": "chemical_permit_reactor_entry",
    "label": "Reactor Entry Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_reactor_entry"
  },
  {
    "value": "chemical_permit_sampling_permit",
    "label": "Sampling Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_sampling_permit"
  },
  {
    "value": "chemical_permit_tank_entry_chemical",
    "label": "Tank Entry Chemical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_permit_templates_tank_entry_chemical"
  },
  {
    "value": "chemical_risk_chemical_release",
    "label": "Chemical Release Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_chemical_release"
  },
  {
    "value": "chemical_risk_corrosion_control",
    "label": "Corrosion Control Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_corrosion_control"
  },
  {
    "value": "chemical_risk_emergency_response",
    "label": "Emergency Response Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_emergency_response"
  },
  {
    "value": "chemical_risk_environmental_impact",
    "label": "Environmental Impact Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_environmental_impact"
  },
  {
    "value": "chemical_risk_material_compatibility",
    "label": "Material Compatibility Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_material_compatibility"
  },
  {
    "value": "chemical_risk_personal_protection",
    "label": "Personal Protection Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_personal_protection"
  },
  {
    "value": "chemical_risk_process_safety",
    "label": "Process Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_process_safety"
  },
  {
    "value": "chemical_risk_reactor_safety",
    "label": "Reactor Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_reactor_safety"
  },
  {
    "value": "chemical_risk_regulatory_compliance",
    "label": "Regulatory Compliance Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_regulatory_compliance"
  },
  {
    "value": "chemical_risk_storage_handling",
    "label": "Storage Handling Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_storage_handling"
  },
  {
    "value": "chemical_risk_toxic_exposure",
    "label": "Toxic Exposure Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_toxic_exposure"
  },
  {
    "value": "chemical_risk_transportation_risks",
    "label": "Transportation Risks Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_transportation_risks"
  },
  {
    "value": "chemical_risk_ventilation_systems",
    "label": "Ventilation Systems Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_ventilation_systems"
  },
  {
    "value": "chemical_risk_waste_management",
    "label": "Waste Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the chemical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "chemical"
    ],
    "template_id": "chemical_get_risk_assessments_waste_management"
  },
  {
    "value": "construction_specialized_concrete_pouring_permit",
    "label": "Concrete Pouring Permit",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_construction_specialized_concrete_pouring_permit"
  },
  {
    "value": "construction_specialized_crane_operation_log",
    "label": "Crane Operation Log",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_construction_specialized_crane_operation_log"
  },
  {
    "value": "construction_specialized_excavation_permit",
    "label": "Excavation Permit",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_construction_specialized_excavation_permit"
  },
  {
    "value": "construction_jsa_concrete_pour_jsa",
    "label": "Concrete Pour JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_concrete_pour_jsa"
  },
  {
    "value": "construction_jsa_confined_space_jsa",
    "label": "Confined Space JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_confined_space_jsa"
  },
  {
    "value": "construction_jsa_crane_lift_jsa",
    "label": "Crane Lift JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_crane_lift_jsa"
  },
  {
    "value": "construction_jsa_demolition_jsa",
    "label": "Demolition JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_demolition_jsa"
  },
  {
    "value": "construction_jsa_electrical_jsa",
    "label": "Electrical JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_electrical_jsa"
  },
  {
    "value": "construction_jsa_excavation_jsa",
    "label": "Excavation JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_excavation_jsa"
  },
  {
    "value": "construction_jsa_hot_work_jsa",
    "label": "Hot Work JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_hot_work_jsa"
  },
  {
    "value": "construction_jsa_roofing_jsa",
    "label": "Roofing JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_roofing_jsa"
  },
  {
    "value": "construction_jsa_scaffold_erection_jsa",
    "label": "Scaffold Erection JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_scaffold_erection_jsa"
  },
  {
    "value": "construction_jsa_steel_erection_jsa",
    "label": "Steel Erection JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_jsa_templates_steel_erection_jsa"
  },
  {
    "value": "construction_msds_adhesives_msds",
    "label": "Adhesives MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_adhesives_msds"
  },
  {
    "value": "construction_msds_asphalt_msds",
    "label": "Asphalt MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_asphalt_msds"
  },
  {
    "value": "construction_msds_cement_msds",
    "label": "Cement MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_cement_msds"
  },
  {
    "value": "construction_msds_cleaning_chemicals_msds",
    "label": "Cleaning Chemicals MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_cleaning_chemicals_msds"
  },
  {
    "value": "construction_msds_concrete_additives_msds",
    "label": "Concrete Additives MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_concrete_additives_msds"
  },
  {
    "value": "construction_msds_epoxy_msds",
    "label": "Epoxy MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_epoxy_msds"
  },
  {
    "value": "construction_msds_fuel_msds",
    "label": "Fuel MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_fuel_msds"
  },
  {
    "value": "construction_msds_oils_greases_msds",
    "label": "Oils Greases MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_oils_greases_msds"
  },
  {
    "value": "construction_msds_paint_msds",
    "label": "Paint MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_paint_msds"
  },
  {
    "value": "construction_msds_solvents_msds",
    "label": "Solvents MSDS",
    "icon": "\ud83e\uddea",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Safety Data Sheet template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_msds_documents_solvents_msds"
  },
  {
    "value": "construction_permit_cold_work",
    "label": "Cold Work Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_permit_templates_cold_work"
  },
  {
    "value": "construction_permit_confined_space",
    "label": "Confined Space Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_permit_templates_confined_space"
  },
  {
    "value": "construction_permit_electrical",
    "label": "Electrical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_permit_templates_electrical"
  },
  {
    "value": "construction_risk_environmental_impact",
    "label": "Environmental Impact Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_risk_assessments_environmental_impact"
  },
  {
    "value": "construction_risk_mechanical_installation",
    "label": "Mechanical Installation Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_risk_assessments_mechanical_installation"
  },
  {
    "value": "construction_risk_piling_operations",
    "label": "Piling Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_risk_assessments_piling_operations"
  },
  {
    "value": "construction_risk_scaffolding",
    "label": "Scaffolding Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_risk_assessments_scaffolding"
  },
  {
    "value": "construction_risk_temporary_works",
    "label": "Temporary Works Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_risk_assessments_temporary_works"
  },
  {
    "value": "construction_risk_traffic_management",
    "label": "Traffic Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the construction industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "construction"
    ],
    "template_id": "construction_get_risk_assessments_traffic_management"
  },
  {
    "value": "education_permit_after_hours",
    "label": "After Hours Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_after_hours"
  },
  {
    "value": "education_permit_chemical_lab",
    "label": "Chemical Lab Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_chemical_lab"
  },
  {
    "value": "education_permit_contractor_access",
    "label": "Contractor Access Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_contractor_access"
  },
  {
    "value": "education_permit_event_permit",
    "label": "Event Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_event_permit"
  },
  {
    "value": "education_permit_facility_access",
    "label": "Facility Access Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_facility_access"
  },
  {
    "value": "education_permit_field_trip",
    "label": "Field Trip Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_field_trip"
  },
  {
    "value": "education_permit_lab_work",
    "label": "Lab Work Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_lab_work"
  },
  {
    "value": "education_permit_maintenance_work",
    "label": "Maintenance Work Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_maintenance_work"
  },
  {
    "value": "education_permit_science_demo",
    "label": "Science Demo Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_science_demo"
  },
  {
    "value": "education_permit_sports_activity",
    "label": "Sports Activity Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_permit_templates_sports_activity"
  },
  {
    "value": "education_risk_child_protection",
    "label": "Child Protection Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_child_protection"
  },
  {
    "value": "education_risk_classroom_safety",
    "label": "Classroom Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_classroom_safety"
  },
  {
    "value": "education_risk_emergency_preparedness",
    "label": "Emergency Preparedness Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_emergency_preparedness"
  },
  {
    "value": "education_risk_field_trips",
    "label": "Field Trips Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_field_trips"
  },
  {
    "value": "education_risk_fire_safety",
    "label": "Fire Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_fire_safety"
  },
  {
    "value": "education_risk_food_service",
    "label": "Food Service Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_food_service"
  },
  {
    "value": "education_risk_laboratory_safety",
    "label": "Laboratory Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_laboratory_safety"
  },
  {
    "value": "education_risk_maintenance_activities",
    "label": "Maintenance Activities Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_maintenance_activities"
  },
  {
    "value": "education_risk_playground_safety",
    "label": "Playground Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_playground_safety"
  },
  {
    "value": "education_risk_special_needs",
    "label": "Special Needs Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_special_needs"
  },
  {
    "value": "education_risk_sports_activities",
    "label": "Sports Activities Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_sports_activities"
  },
  {
    "value": "education_risk_staff_training",
    "label": "Staff Training Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_staff_training"
  },
  {
    "value": "education_risk_transportation_safety",
    "label": "Transportation Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_transportation_safety"
  },
  {
    "value": "education_risk_visitor_management",
    "label": "Visitor Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the education industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "education"
    ],
    "template_id": "education_get_risk_assessments_visitor_management"
  },
  {
    "value": "power_generation_permit_energy_permit",
    "label": "Energy Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_permit_templates_energy_permit"
  },
  {
    "value": "power_generation_risk_cyber_security",
    "label": "Cyber Security Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_cyber_security"
  },
  {
    "value": "power_generation_risk_distribution_networks",
    "label": "Distribution Networks Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_distribution_networks"
  },
  {
    "value": "power_generation_risk_emergency_shutdown",
    "label": "Emergency Shutdown Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_emergency_shutdown"
  },
  {
    "value": "power_generation_risk_energy_storage",
    "label": "Energy Storage Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_energy_storage"
  },
  {
    "value": "power_generation_risk_environmental_compliance",
    "label": "Environmental Compliance Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_environmental_compliance"
  },
  {
    "value": "power_generation_risk_high_voltage",
    "label": "High Voltage Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_high_voltage"
  },
  {
    "value": "power_generation_risk_maintenance_operations",
    "label": "Maintenance Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_maintenance_operations"
  },
  {
    "value": "power_generation_risk_power_generation",
    "label": "Power Generation Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_power_generation"
  },
  {
    "value": "power_generation_risk_public_safety",
    "label": "Public Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_public_safety"
  },
  {
    "value": "power_generation_risk_renewable_energy",
    "label": "Renewable Energy Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_renewable_energy"
  },
  {
    "value": "power_generation_risk_smart_grid_operations",
    "label": "Smart Grid Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_smart_grid_operations"
  },
  {
    "value": "power_generation_risk_substation_safety",
    "label": "Substation Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_substation_safety"
  },
  {
    "value": "power_generation_risk_transmission_lines",
    "label": "Transmission Lines Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_transmission_lines"
  },
  {
    "value": "power_generation_risk_turbine_operations",
    "label": "Turbine Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the power generation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "power_generation"
    ],
    "template_id": "energy_get_risk_assessments_turbine_operations"
  },
  {
    "value": "healthcare_specialized_medical_device_safety",
    "label": "Medical Device Safety",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_healthcare_specialized_medical_device_safety"
  },
  {
    "value": "healthcare_permit_healthcare_permit",
    "label": "Healthcare Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_permit_templates_healthcare_permit"
  },
  {
    "value": "healthcare_risk_elderly_care_risks",
    "label": "Elderly Care Risks Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_elderly_care_risks"
  },
  {
    "value": "healthcare_risk_icu_critical_care",
    "label": "Icu Critical Care Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_icu_critical_care"
  },
  {
    "value": "healthcare_risk_infection_control",
    "label": "Infection Control Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_infection_control"
  },
  {
    "value": "healthcare_risk_medical_device_safety",
    "label": "Medical Device Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_medical_device_safety"
  },
  {
    "value": "healthcare_risk_medication_safety",
    "label": "Medication Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_medication_safety"
  },
  {
    "value": "healthcare_risk_mental_health_risks",
    "label": "Mental Health Risks Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_mental_health_risks"
  },
  {
    "value": "healthcare_risk_pediatric_safety",
    "label": "Pediatric Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the healthcare industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "healthcare"
    ],
    "template_id": "healthcare_get_risk_assessments_pediatric_safety"
  },
  {
    "value": "manufacturing_jsa_chemical_mixing_jsa",
    "label": "Chemical Mixing JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_chemical_mixing_jsa"
  },
  {
    "value": "manufacturing_jsa_grinding_jsa",
    "label": "Grinding JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_grinding_jsa"
  },
  {
    "value": "manufacturing_jsa_lockout_tagout_jsa",
    "label": "Lockout Tagout JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_lockout_tagout_jsa"
  },
  {
    "value": "manufacturing_jsa_machine_operation_jsa",
    "label": "Machine Operation JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_machine_operation_jsa"
  },
  {
    "value": "manufacturing_jsa_press_operation_jsa",
    "label": "Press Operation JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_press_operation_jsa"
  },
  {
    "value": "manufacturing_jsa_robotic_cell_jsa",
    "label": "Robotic Cell JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_robotic_cell_jsa"
  },
  {
    "value": "manufacturing_jsa_welding_jsa",
    "label": "Welding JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_jsa_templates_welding_jsa"
  },
  {
    "value": "manufacturing_specialized_chemical_handling_protocols",
    "label": "Chemical Handling Protocols",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_manufacturing_specialized_chemical_handling_protocols"
  },
  {
    "value": "manufacturing_specialized_lockout_tagout_procedures",
    "label": "Lockout Tagout Procedures",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_manufacturing_specialized_lockout_tagout_procedures"
  },
  {
    "value": "manufacturing_specialized_machine_safety_certifications",
    "label": "Machine Safety Certifications",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_manufacturing_specialized_machine_safety_certifications"
  },
  {
    "value": "manufacturing_specialized_production_line_safety_reviews",
    "label": "Production Line Safety Reviews",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_manufacturing_specialized_production_line_safety_reviews"
  },
  {
    "value": "manufacturing_method_changeover_procedure",
    "label": "Changeover Procedure",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_changeover_procedure"
  },
  {
    "value": "manufacturing_method_cleaning_procedure",
    "label": "Cleaning Procedure",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_cleaning_procedure"
  },
  {
    "value": "manufacturing_method_machine_setup_method",
    "label": "Machine Setup Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_machine_setup_method"
  },
  {
    "value": "manufacturing_method_maintenance_procedure",
    "label": "Maintenance Procedure",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_maintenance_procedure"
  },
  {
    "value": "manufacturing_method_material_handling_method",
    "label": "Material Handling Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_material_handling_method"
  },
  {
    "value": "manufacturing_method_production_line_method",
    "label": "Production Line Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_production_line_method"
  },
  {
    "value": "manufacturing_method_quality_control_method",
    "label": "Quality Control Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_method_statements_quality_control_method"
  },
  {
    "value": "manufacturing_permit_chemical_handling",
    "label": "Chemical Handling Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_chemical_handling"
  },
  {
    "value": "manufacturing_permit_confined_space_manufacturing",
    "label": "Confined Space Manufacturing Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_confined_space_manufacturing"
  },
  {
    "value": "manufacturing_permit_electrical_manufacturing",
    "label": "Electrical Manufacturing Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_electrical_manufacturing"
  },
  {
    "value": "manufacturing_permit_forklift_operation",
    "label": "Forklift Operation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_forklift_operation"
  },
  {
    "value": "manufacturing_permit_hot_work_manufacturing",
    "label": "Hot Work Manufacturing Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_hot_work_manufacturing"
  },
  {
    "value": "manufacturing_permit_line_maintenance",
    "label": "Line Maintenance Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_line_maintenance"
  },
  {
    "value": "manufacturing_permit_lockout_tagout",
    "label": "Lockout Tagout Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_lockout_tagout"
  },
  {
    "value": "manufacturing_permit_machine_maintenance",
    "label": "Machine Maintenance Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_machine_maintenance"
  },
  {
    "value": "manufacturing_permit_press_operation",
    "label": "Press Operation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_press_operation"
  },
  {
    "value": "manufacturing_permit_robotic_cell",
    "label": "Robotic Cell Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_permit_templates_robotic_cell"
  },
  {
    "value": "manufacturing_risk_chemical_exposure",
    "label": "Chemical Exposure Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_chemical_exposure"
  },
  {
    "value": "manufacturing_risk_electrical_safety",
    "label": "Electrical Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_electrical_safety"
  },
  {
    "value": "manufacturing_risk_ergonomic_hazards",
    "label": "Ergonomic Hazards Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_ergonomic_hazards"
  },
  {
    "value": "manufacturing_risk_fire_safety",
    "label": "Fire Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_fire_safety"
  },
  {
    "value": "manufacturing_risk_noise_exposure",
    "label": "Noise Exposure Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_noise_exposure"
  },
  {
    "value": "manufacturing_risk_pressurized_systems",
    "label": "Pressurized Systems Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_pressurized_systems"
  },
  {
    "value": "manufacturing_risk_robotics_automation",
    "label": "Robotics Automation Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_robotics_automation"
  },
  {
    "value": "manufacturing_risk_supply_chain_risks",
    "label": "Supply Chain Risks Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the manufacturing industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "manufacturing"
    ],
    "template_id": "manufacturing_get_risk_assessments_supply_chain_risks"
  },
  {
    "value": "maritime_permit_maritime_permit",
    "label": "Maritime Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_permit_templates_maritime_permit"
  },
  {
    "value": "maritime_risk_anchoring_operations",
    "label": "Anchoring Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_anchoring_operations"
  },
  {
    "value": "maritime_risk_bunkering",
    "label": "Bunkering Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_bunkering"
  },
  {
    "value": "maritime_risk_chemical_handling_permit",
    "label": "Chemical Handling Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_chemical_handling_permit"
  },
  {
    "value": "maritime_risk_confined_space_entry",
    "label": "Confined Space Entry Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_confined_space_entry"
  },
  {
    "value": "maritime_risk_confined_space_permit",
    "label": "Confined Space Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_confined_space_permit"
  },
  {
    "value": "maritime_risk_crane_operations",
    "label": "Crane Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_crane_operations"
  },
  {
    "value": "maritime_risk_crane_permit",
    "label": "Crane Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_crane_permit"
  },
  {
    "value": "maritime_risk_deck_operations",
    "label": "Deck Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_deck_operations"
  },
  {
    "value": "maritime_risk_electrical_permit",
    "label": "Electrical Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_electrical_permit"
  },
  {
    "value": "maritime_risk_electrical_safety",
    "label": "Electrical Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_electrical_safety"
  },
  {
    "value": "maritime_risk_enclosed_spaces",
    "label": "Enclosed Spaces Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_enclosed_spaces"
  },
  {
    "value": "maritime_risk_engine_room_safety",
    "label": "Engine Room Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_engine_room_safety"
  },
  {
    "value": "maritime_risk_excavation_permit",
    "label": "Excavation Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_excavation_permit"
  },
  {
    "value": "maritime_risk_fire_safety",
    "label": "Fire Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_fire_safety"
  },
  {
    "value": "maritime_risk_heavy_lifting",
    "label": "Heavy Lifting Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_heavy_lifting"
  },
  {
    "value": "maritime_risk_hot_work",
    "label": "Hot Work Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_hot_work"
  },
  {
    "value": "maritime_risk_hot_work_permit",
    "label": "Hot Work Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_hot_work_permit"
  },
  {
    "value": "maritime_risk_lifeboat_drills",
    "label": "Lifeboat Drills Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_lifeboat_drills"
  },
  {
    "value": "maritime_risk_lifting_permit",
    "label": "Lifting Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_lifting_permit"
  },
  {
    "value": "maritime_risk_man_overboard",
    "label": "Man Overboard Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_man_overboard"
  },
  {
    "value": "maritime_risk_mooring_operations",
    "label": "Mooring Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_mooring_operations"
  },
  {
    "value": "maritime_risk_navigation_safety",
    "label": "Navigation Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_navigation_safety"
  },
  {
    "value": "maritime_risk_onshore_support",
    "label": "Onshore Support Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_onshore_support"
  },
  {
    "value": "maritime_risk_personnel_transfer",
    "label": "Personnel Transfer Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_personnel_transfer"
  },
  {
    "value": "maritime_risk_piracy_security",
    "label": "Piracy Security Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_piracy_security"
  },
  {
    "value": "maritime_risk_radiography_permit",
    "label": "Radiography Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_radiography_permit"
  },
  {
    "value": "maritime_risk_scaffolding",
    "label": "Scaffolding Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_scaffolding"
  },
  {
    "value": "maritime_risk_ship_handling",
    "label": "Ship Handling Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_ship_handling"
  },
  {
    "value": "maritime_risk_shipyard_safety",
    "label": "Shipyard Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_shipyard_safety"
  },
  {
    "value": "maritime_risk_towing_operations",
    "label": "Towing Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_towing_operations"
  },
  {
    "value": "maritime_risk_vessel_maintenance",
    "label": "Vessel Maintenance Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_vessel_maintenance"
  },
  {
    "value": "maritime_risk_weather_operations",
    "label": "Weather Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_weather_operations"
  },
  {
    "value": "maritime_risk_welding_permit",
    "label": "Welding Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_welding_permit"
  },
  {
    "value": "maritime_risk_work_at_height",
    "label": "Work At Height Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_work_at_height"
  },
  {
    "value": "maritime_risk_work_at_height_permit",
    "label": "Work At Height Permit Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the maritime industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "maritime"
    ],
    "template_id": "maritime_get_risk_assessments_work_at_height_permit"
  },
  {
    "value": "mining_jsa_confined_space_jsa",
    "label": "Confined Space JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_confined_space_jsa"
  },
  {
    "value": "mining_jsa_conveyor_maintenance_jsa",
    "label": "Conveyor Maintenance JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_conveyor_maintenance_jsa"
  },
  {
    "value": "mining_jsa_crusher_operation_jsa",
    "label": "Crusher Operation JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_crusher_operation_jsa"
  },
  {
    "value": "mining_jsa_drilling_blasting_jsa",
    "label": "Drilling Blasting JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_drilling_blasting_jsa"
  },
  {
    "value": "mining_jsa_electrical_maintenance_jsa",
    "label": "Electrical Maintenance JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_electrical_maintenance_jsa"
  },
  {
    "value": "mining_jsa_emergency_rescue_jsa",
    "label": "Emergency Rescue JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_emergency_rescue_jsa"
  },
  {
    "value": "mining_jsa_ground_control_jsa",
    "label": "Ground Control JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_ground_control_jsa"
  },
  {
    "value": "mining_jsa_haul_truck_operation_jsa",
    "label": "Haul Truck Operation JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_haul_truck_operation_jsa"
  },
  {
    "value": "mining_jsa_shaft_sinking_jsa",
    "label": "Shaft Sinking JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_shaft_sinking_jsa"
  },
  {
    "value": "mining_jsa_ventilation_installation_jsa",
    "label": "Ventilation Installation JSA",
    "icon": "\ud83e\uddfe",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "JSA template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_jsa_templates_ventilation_installation_jsa"
  },
  {
    "value": "mining_method_dewatering_method",
    "label": "Dewatering Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_method_statements_dewatering_method"
  },
  {
    "value": "mining_method_exploration_method",
    "label": "Exploration Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_method_statements_exploration_method"
  },
  {
    "value": "mining_method_extraction_method",
    "label": "Extraction Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_method_statements_extraction_method"
  },
  {
    "value": "mining_method_ground_support_method",
    "label": "Ground Support Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_method_statements_ground_support_method"
  },
  {
    "value": "mining_method_processing_method",
    "label": "Processing Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_method_statements_processing_method"
  },
  {
    "value": "mining_method_rehabilitation_method",
    "label": "Rehabilitation Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_method_statements_rehabilitation_method"
  },
  {
    "value": "mining_permit_blast_zone_entry",
    "label": "Blast Zone Entry Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_blast_zone_entry"
  },
  {
    "value": "mining_permit_confined_space_mining",
    "label": "Confined Space Mining Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_confined_space_mining"
  },
  {
    "value": "mining_permit_emergency_response_mining",
    "label": "Emergency Response Mining Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_emergency_response_mining"
  },
  {
    "value": "mining_permit_ground_control",
    "label": "Ground Control Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_ground_control"
  },
  {
    "value": "mining_permit_high_voltage_mining",
    "label": "High Voltage Mining Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_high_voltage_mining"
  },
  {
    "value": "mining_permit_hot_work_mining",
    "label": "Hot Work Mining Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_hot_work_mining"
  },
  {
    "value": "mining_permit_vehicle_entry",
    "label": "Vehicle Entry Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_vehicle_entry"
  },
  {
    "value": "mining_permit_ventilation_work",
    "label": "Ventilation Work Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_ventilation_work"
  },
  {
    "value": "mining_permit_water_management",
    "label": "Water Management Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_permit_templates_water_management"
  },
  {
    "value": "mining_risk_contractor_management",
    "label": "Contractor Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_contractor_management"
  },
  {
    "value": "mining_risk_dust_exposure",
    "label": "Dust Exposure Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_dust_exposure"
  },
  {
    "value": "mining_risk_electrical_safety",
    "label": "Electrical Safety Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_electrical_safety"
  },
  {
    "value": "mining_risk_environmental_impact",
    "label": "Environmental Impact Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_environmental_impact"
  },
  {
    "value": "mining_risk_explosives_handling",
    "label": "Explosives Handling Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_explosives_handling"
  },
  {
    "value": "mining_risk_ground_control",
    "label": "Ground Control Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_ground_control"
  },
  {
    "value": "mining_risk_mine_rescue",
    "label": "Mine Rescue Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_mine_rescue"
  },
  {
    "value": "mining_risk_slope_stability",
    "label": "Slope Stability Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_slope_stability"
  },
  {
    "value": "mining_risk_training_competency",
    "label": "Training Competency Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_training_competency"
  },
  {
    "value": "mining_risk_vehicle_interaction",
    "label": "Vehicle Interaction Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_vehicle_interaction"
  },
  {
    "value": "mining_risk_ventilation_systems",
    "label": "Ventilation Systems Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_ventilation_systems"
  },
  {
    "value": "mining_risk_water_management",
    "label": "Water Management Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the mining industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "mining"
    ],
    "template_id": "mining_get_risk_assessments_water_management"
  },
  {
    "value": "oil_gas_method_drilling_procedure",
    "label": "Drilling Procedure",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_drilling_procedure"
  },
  {
    "value": "oil_gas_method_emergency_response_method",
    "label": "Emergency Response Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_emergency_response_method"
  },
  {
    "value": "oil_gas_method_environmental_protection_method",
    "label": "Environmental Protection Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_environmental_protection_method"
  },
  {
    "value": "oil_gas_method_pipe_inspection_method",
    "label": "Pipe Inspection Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_pipe_inspection_method"
  },
  {
    "value": "oil_gas_method_rig_inspection_method",
    "label": "Rig Inspection Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_rig_inspection_method"
  },
  {
    "value": "oil_gas_method_safety_case_method",
    "label": "Safety Case Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_safety_case_method"
  },
  {
    "value": "oil_gas_method_simops_procedure",
    "label": "Simops Procedure",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_simops_procedure"
  },
  {
    "value": "oil_gas_method_well_control_method",
    "label": "Well Control Method",
    "icon": "\ud83d\udcdd",
    "complexity": "medium",
    "category": "procedures",
    "color": "#531dab",
    "description": "Method Statement template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_method_statements_well_control_method"
  },
  {
    "value": "oil_gas_specialized_bowtie_assessment",
    "label": "Bowtie Assessment",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_oilgas_specialized_bowtie_assessment"
  },
  {
    "value": "oil_gas_specialized_safety_case",
    "label": "Safety Case",
    "icon": "\ud83d\udcc4",
    "complexity": "medium",
    "category": "reports",
    "color": "#08979c",
    "description": "Specialized Document template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_oilgas_specialized_safety_case"
  },
  {
    "value": "oil_gas_permit_confined_space",
    "label": "Confined Space Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_permit_templates_confined_space"
  },
  {
    "value": "oil_gas_permit_electrical",
    "label": "Electrical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_permit_templates_electrical"
  },
  {
    "value": "oil_gas_permit_excavation",
    "label": "Excavation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_permit_templates_excavation"
  },
  {
    "value": "oil_gas_permit_h2s_entry",
    "label": "H2S Entry Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_permit_templates_h2s_entry"
  },
  {
    "value": "oil_gas_permit_hot_work",
    "label": "Hot Work Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_permit_templates_hot_work"
  },
  {
    "value": "oil_gas_permit_lifting",
    "label": "Lifting Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_permit_templates_lifting"
  },
  {
    "value": "oil_gas_risk_confined_space_entry",
    "label": "Confined Space Entry Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_confined_space_entry"
  },
  {
    "value": "oil_gas_risk_emergency_response",
    "label": "Emergency Response Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_emergency_response"
  },
  {
    "value": "oil_gas_risk_environmental_protection",
    "label": "Environmental Protection Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_environmental_protection"
  },
  {
    "value": "oil_gas_risk_hot_work_operations",
    "label": "Hot Work Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_hot_work_operations"
  },
  {
    "value": "oil_gas_risk_hydrocarbon_release",
    "label": "Hydrocarbon Release Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_hydrocarbon_release"
  },
  {
    "value": "oil_gas_risk_lifting_operations",
    "label": "Lifting Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_lifting_operations"
  },
  {
    "value": "oil_gas_risk_permit_to_work",
    "label": "Permit To Work Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_permit_to_work"
  },
  {
    "value": "oil_gas_risk_simultaneous_operations",
    "label": "Simultaneous Operations Risk Assessment",
    "icon": "\ud83d\udcca",
    "complexity": "medium",
    "category": "assessments",
    "color": "#d4380d",
    "description": "Risk Assessment template for the oil gas industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "oil_gas"
    ],
    "template_id": "oilgas_get_risk_assessments_simultaneous_operations"
  },
  {
    "value": "pharmaceutical_permit_pharmaceutical_permit",
    "label": "Pharmaceutical Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the pharmaceutical industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "pharmaceutical"
    ],
    "template_id": "pharmaceutical_get_permit_templates_pharmaceutical_permit"
  },
  {
    "value": "transportation_permit_transportation_permit",
    "label": "Transportation Permit",
    "icon": "\ud83d\udec2",
    "complexity": "medium",
    "category": "permits",
    "color": "#d46b08",
    "description": "Permit template for the transportation industry",
    "estimated_time": "15-25 min",
    "plan_required": "pro",
    "industries": [
      "transportation"
    ],
    "template_id": "transportation_get_permit_templates_transportation_permit"
  }
];

// ----------------------------------------------------------------------------
// Added 2026-11-23: cross-industry templates that exist in the backend (HSEDocumentGeneratorHub, 448 IDs)
// but were not offered on the page. Each was checked to return a full document.
// ----------------------------------------------------------------------------
const CROSS_INDUSTRY_DOCS_2026_11 = [
  {
    "value": "contractor_induction_record",
    "label": "Contractor Induction Record",
    "icon": "📚",
    "complexity": "medium",
    "category": "records",
    "color": "#2f54eb",
    "description": "Contractor management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "contractormanagement_get_contractor_templates_contractor_induction_record"
  },
  {
    "value": "contractor_performance_evaluation",
    "label": "Contractor Performance Evaluation",
    "icon": "📊",
    "complexity": "medium",
    "category": "assessments",
    "color": "#2f54eb",
    "description": "Contractor management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "contractormanagement_get_contractor_templates_contractor_performance_evaluation"
  },
  {
    "value": "contractor_prequalification",
    "label": "Contractor Prequalification Assessment",
    "icon": "📊",
    "complexity": "medium",
    "category": "assessments",
    "color": "#2f54eb",
    "description": "Contractor management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "contractormanagement_get_contractor_templates_contractor_prequalification"
  },
  {
    "value": "contractor_safety_agreement",
    "label": "Contractor Safety Agreement",
    "icon": "👔",
    "complexity": "medium",
    "category": "management",
    "color": "#2f54eb",
    "description": "Contractor management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "contractormanagement_get_contractor_templates_contractor_safety_agreement"
  },
  {
    "value": "contractor_safety_assessment",
    "label": "Contractor Safety Assessment",
    "icon": "📊",
    "complexity": "medium",
    "category": "assessments",
    "color": "#2f54eb",
    "description": "Contractor management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "contractormanagement_get_contractor_templates_contractor_safety_assessment"
  },
  {
    "value": "subcontractor_management_plan",
    "label": "Subcontractor Management Plan",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#2f54eb",
    "description": "Contractor management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "contractormanagement_get_contractor_templates_subcontractor_management_plan"
  },
  {
    "value": "medical_emergency_protocol",
    "label": "Medical Emergency Protocol",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#cf1322",
    "description": "Emergency response template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "emergencyresponse_get_emergency_templates_medical_emergency_protocol"
  },
  {
    "value": "rescue_operations_plan",
    "label": "Rescue Operations Plan",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#cf1322",
    "description": "Emergency response template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "emergencyresponse_get_emergency_templates_rescue_operations_plan"
  },
  {
    "value": "spill_response_plan",
    "label": "Spill Response Plan",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#cf1322",
    "description": "Emergency response template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "emergencyresponse_get_emergency_templates_spill_response_plan"
  },
  {
    "value": "chemical_management_plan",
    "label": "Chemical Management Plan",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#389e0d",
    "description": "Environmental template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "environmental_get_environmental_templates_chemical_management_plan"
  },
  {
    "value": "emissions_monitoring_report",
    "label": "Emissions Monitoring Report",
    "icon": "📏",
    "complexity": "medium",
    "category": "monitoring",
    "color": "#389e0d",
    "description": "Environmental template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "environmental_get_environmental_templates_emissions_monitoring_report"
  },
  {
    "value": "pollution_prevention_plan",
    "label": "Pollution Prevention Plan",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#389e0d",
    "description": "Environmental template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "environmental_get_environmental_templates_pollution_prevention_plan"
  },
  {
    "value": "sustainability_report",
    "label": "Sustainability Report",
    "icon": "📄",
    "complexity": "medium",
    "category": "reports",
    "color": "#389e0d",
    "description": "Environmental template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "environmental_get_environmental_templates_sustainability_report"
  },
  {
    "value": "waste_management_plan",
    "label": "Waste Management Plan",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#389e0d",
    "description": "Environmental template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "environmental_get_environmental_templates_waste_management_plan"
  },
  {
    "value": "calibration_records",
    "label": "Calibration Records",
    "icon": "📚",
    "complexity": "medium",
    "category": "records",
    "color": "#d46b08",
    "description": "Equipment safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "equipmentsafety_get_equipment_templates_calibration_records"
  },
  {
    "value": "lifting_equipment_certificate",
    "label": "Lifting Equipment Certificate",
    "icon": "🏆",
    "complexity": "medium",
    "category": "certificates",
    "color": "#d46b08",
    "description": "Equipment safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "equipmentsafety_get_equipment_templates_lifting_equipment_certificate"
  },
  {
    "value": "pressure_vessel_inspection",
    "label": "Pressure Vessel Inspection",
    "icon": "✅",
    "complexity": "medium",
    "category": "inspections",
    "color": "#d46b08",
    "description": "Equipment safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "equipmentsafety_get_equipment_templates_pressure_vessel_inspection"
  },
  {
    "value": "preventive_maintenance_schedule",
    "label": "Preventive Maintenance Schedule",
    "icon": "🗺️",
    "complexity": "medium",
    "category": "plans",
    "color": "#d46b08",
    "description": "Equipment safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "equipmentsafety_get_equipment_templates_preventive_maintenance_schedule"
  },
  {
    "value": "air_monitoring_report",
    "label": "Air Monitoring Report",
    "icon": "📏",
    "complexity": "medium",
    "category": "monitoring",
    "color": "#52c41a",
    "description": "Health & hygiene template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "healthhygiene_get_health_templates_air_monitoring_report"
  },
  {
    "value": "biological_monitoring",
    "label": "Biological Monitoring",
    "icon": "📏",
    "complexity": "medium",
    "category": "monitoring",
    "color": "#52c41a",
    "description": "Health & hygiene template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "healthhygiene_get_health_templates_biological_monitoring"
  },
  {
    "value": "health_surveillance_program",
    "label": "Health Surveillance Program",
    "icon": "🏥",
    "complexity": "medium",
    "category": "health",
    "color": "#52c41a",
    "description": "Health & hygiene template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "healthhygiene_get_health_templates_health_surveillance_program"
  },
  {
    "value": "workplace_hygiene_survey",
    "label": "Workplace Hygiene Survey",
    "icon": "🏥",
    "complexity": "medium",
    "category": "health",
    "color": "#52c41a",
    "description": "Health & hygiene template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "healthhygiene_get_health_templates_workplace_hygiene_survey"
  },
  {
    "value": "corrective_action_plan",
    "label": "Corrective Action Plan",
    "icon": "⚠️",
    "complexity": "medium",
    "category": "incidents",
    "color": "#cf1322",
    "description": "Incident management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "incidentmanagement_get_incident_templates_corrective_action_plan"
  },
  {
    "value": "lessons_learned_report",
    "label": "Lessons Learned Report",
    "icon": "⚠️",
    "complexity": "medium",
    "category": "incidents",
    "color": "#cf1322",
    "description": "Incident management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "incidentmanagement_get_incident_templates_lessons_learned_report"
  },
  {
    "value": "near_miss_report",
    "label": "Near Miss Report",
    "icon": "⚠️",
    "complexity": "medium",
    "category": "incidents",
    "color": "#cf1322",
    "description": "Incident management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "incidentmanagement_get_incident_templates_near_miss_report"
  },
  {
    "value": "root_cause_analysis",
    "label": "Root Cause Analysis",
    "icon": "📊",
    "complexity": "medium",
    "category": "analysis",
    "color": "#cf1322",
    "description": "Incident management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "incidentmanagement_get_incident_templates_root_cause_analysis"
  },
  {
    "value": "compliance_inspection_checklist",
    "label": "Compliance Inspection Checklist",
    "icon": "✅",
    "complexity": "medium",
    "category": "checklists",
    "color": "#08979c",
    "description": "Inspection & monitoring template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "inspectionmonitoring_get_inspection_templates_compliance_inspection_checklist"
  },
  {
    "value": "safety_tour_report",
    "label": "Safety Tour Report",
    "icon": "✅",
    "complexity": "medium",
    "category": "inspections",
    "color": "#08979c",
    "description": "Inspection & monitoring template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "inspectionmonitoring_get_inspection_templates_safety_tour_report"
  },
  {
    "value": "safety_walkthrough_checklist",
    "label": "Safety Walkthrough Checklist",
    "icon": "✅",
    "complexity": "medium",
    "category": "checklists",
    "color": "#08979c",
    "description": "Inspection & monitoring template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "inspectionmonitoring_get_inspection_templates_safety_walkthrough_checklist"
  },
  {
    "value": "permit_to_work_log",
    "label": "Permit to Work Log",
    "icon": "📚",
    "complexity": "medium",
    "category": "records",
    "color": "#096dd9",
    "description": "Operational safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "operationalsafety_get_operational_templates_permit_to_work_log"
  },
  {
    "value": "pre_task_briefing",
    "label": "Pre-Task Briefing",
    "icon": "📋",
    "complexity": "medium",
    "category": "procedures",
    "color": "#096dd9",
    "description": "Operational safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "operationalsafety_get_operational_templates_pre_task_briefing"
  },
  {
    "value": "safe_work_method_statement",
    "label": "Safe Work Method Statement (SWMS)",
    "icon": "📋",
    "complexity": "medium",
    "category": "procedures",
    "color": "#096dd9",
    "description": "Operational safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "operationalsafety_get_operational_templates_safe_work_method_statement"
  },
  {
    "value": "shift_handover_checklist",
    "label": "Shift Handover Checklist",
    "icon": "✅",
    "complexity": "medium",
    "category": "checklists",
    "color": "#096dd9",
    "description": "Operational safety template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "operationalsafety_get_operational_templates_shift_handover_checklist"
  },
  {
    "value": "management_review_report",
    "label": "Management Review Report",
    "icon": "👔",
    "complexity": "medium",
    "category": "management",
    "color": "#722ed1",
    "description": "Safety management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "safetymanagement_get_management_templates_management_review_report"
  },
  {
    "value": "safety_budget_plan",
    "label": "Safety Budget Plan",
    "icon": "👔",
    "complexity": "medium",
    "category": "management",
    "color": "#722ed1",
    "description": "Safety management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "safetymanagement_get_management_templates_safety_budget_plan"
  },
  {
    "value": "safety_kpi_dashboard",
    "label": "Safety KPI Dashboard",
    "icon": "👔",
    "complexity": "medium",
    "category": "management",
    "color": "#722ed1",
    "description": "Safety management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "safetymanagement_get_management_templates_safety_kpi_dashboard"
  },
  {
    "value": "safety_management_manual",
    "label": "Safety Management Manual",
    "icon": "📜",
    "complexity": "medium",
    "category": "policy",
    "color": "#722ed1",
    "description": "Safety management template that applies to every industry",
    "estimated_time": "15-25 min",
    "plan_required": "basic",
    "industries": [
      "all"
    ],
    "template_id": "safetymanagement_get_management_templates_safety_management_manual"
  }
];
CROSS_INDUSTRY_DOCS_2026_11.forEach((doc) => {
  BACKEND_TEMPLATE_IDS.add(doc.template_id);
  if (!BACKEND_ONLY_DOCS.some((d) => d.value === doc.value)) BACKEND_ONLY_DOCS.push(doc);
});
