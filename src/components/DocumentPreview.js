import React from 'react';

function DocumentPreview({ data }) {
  if (!data) {
    return (
      <div className="document-preview">
        <div className="iso-template">
          <div className="iso-header">
            <div className="company-info">
              <div>Company Name</div>
              <div>Address Line 1</div>
              <div>Address Line 2</div>
              <div>Phone: +1 (123) 456-7890</div>
            </div>
            <div className="company-logo-placeholder">
              Company Logo
            </div>
          </div>
          <div className="document-title">Document Title</div>
          <div className="document-meta">
            <div>Document ID: STP-RA-2023-001</div>
            <div>Date: <span>{new Date().toLocaleDateString()}</span></div>
          </div>
          <div className="document-content">
            <p>Your generated document will appear here. Use the form above to create a new document.</p>
          </div>
          <div className="document-footer">
            <p>Confidential - For internal use only</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
      </div>
    );
  }

  // You can expand here to match your actual template logic
  return (
    <div className="document-preview">
      <div className="iso-template">
        <div className="iso-header">
          <div className="company-info">
            <div>{data.company || "Company Name"}</div>
            <div>Address Line 1</div>
            <div>Address Line 2</div>
            <div>Phone: +1 (123) 456-7890</div>
          </div>
          <div className="company-logo-placeholder">
            {data.logo ? <img src={URL.createObjectURL(data.logo)} alt="Company Logo" style={{ maxWidth: 150, maxHeight: 80 }} /> : "Company Logo"}
          </div>
        </div>
        <div className="document-title">{data.topic || "Document Title"}</div>
        <div className="document-meta">
          <div>Document ID: STP-RA-2023-001</div>
          <div>Date: <span>{data.date}</span></div>
        </div>
        <div className="document-content">
          <p>
            {data.type === "riskAssessment"
              ? `Risk assessment for ${data.topic}.`
              : data.type === "safetyPlan"
              ? `Safety plan for ${data.topic}.`
              : data.type === "incidentReport"
              ? `Incident report for ${data.topic}.`
              : data.type === "inspectionChecklist"
              ? `Inspection checklist for ${data.topic}.`
              : data.type === "sop"
              ? `Standard operating procedure for ${data.topic}.`
              : `Custom document for ${data.topic}.`
            }
            {data.info && <div><strong>Additional Info:</strong> {data.info}</div>}
          </p>
        </div>
        <div className="document-footer">
          <p>Confidential - For internal use only</p>
          <p>Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreview;