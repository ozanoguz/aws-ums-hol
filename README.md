# AWS UMS Hands-on Lab

Deploy FortiManager and FortiGate Auto Scaling on AWS, provision inspection through FortiManager UMS/FortiFlex, and observe real web traffic through the FortiGates.

## Student guide

[Start the maintained lab guide](docs/introduction.md). The sidebar and introduction list Sections 1–13 in order.

- [Terraform deployment — Section 9](docs/section-9-terraform-asg.md)
- [FortiManager templates and policies — Section 10](docs/section-10-fortimanager-configuration.md)
- [Scale from two to three FortiGates — Section 12](docs/section-11-scale-asg.md)

The guide lives in `docs/`; this README does not duplicate its instructions. Existing page filenames are retained so published links remain valid even where section numbers have changed.

## Repository contents

- `docs/`: student lab guide and VitePress site.
- `terraform/`: deployment modules, lab example and student web demo.
- `scoring_service/`: instructor-only classroom dashboard and setup tools; students do not need to deploy it.
- `credential-portal/`: instructor credential distribution service.

## Build the documentation

```bash
npm ci
npm run docs:build
```

Use `npm run docs:dev` for a local preview. Follow each instructor tool's own README for its deployment instructions.
